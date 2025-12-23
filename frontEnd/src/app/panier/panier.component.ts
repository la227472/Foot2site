import {Component, computed, OnInit, signal} from '@angular/core';
import { Router } from '@angular/router';
import { PanierService } from '../Service/panier.service';
import { Panier } from '../Interface/Panier';
import {isCaptureEventType} from '@angular/core/primitives/event-dispatch';
import {forkJoin} from 'rxjs';
import {CommandeService} from '../Service/commande.service';
import {ConnectionService} from '../Service/connection.service';
import {Configuration, ConfigurationComplete} from '../Interface/Configuration';
import {ConfigurationService} from '../Service/configuration.service';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  imports: [
  ],
  styleUrl: './panier.component.css'
})
export class PanierComponent implements  OnInit{

  // 🔹 État panier
  panier = computed(() => this.panierService.panierItems());

  configsUtilisateur = signal<ConfigurationComplete[]>([]);
  selectedConfig = signal<ConfigurationComplete | null>(null);
  isDropdownOpen = signal(false);

  // 🔹 Totaux
  subtotal = computed(() => this.panierService.getTotalPrice());
  shippingCost = computed(() => this.subtotal() > 100 ? 0 : 9.99);
  total = computed(() => this.subtotal() + this.shippingCost());

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private panierService: PanierService,
    private commandeService : CommandeService,
    private configService : ConfigurationService,
    private authService : ConnectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.errorMessage = 'Veuillez vous connecter pour voir vos configurations.';
      return;
    }

    this.configService.getConfigurationsComplete().subscribe({
      next: (configs) => {
        const filtered = configs.filter(c => c.utilisateurId === user.id);
        this.configsUtilisateur.set(filtered);

        console.log(
          `${filtered.length} config(s) chargée(s) pour l'utilisateur ${user.firstname}`
        );
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les configurations.';
      }
    });
  }

  // ======================
  // QUANTITÉ
  // ======================

  incrementQuantity(item: Panier): void {
    const key = this.getKey(item);
    this.panierService.updateQuantity(key, item.quantite + 1);
  }

  decrementQuantity(item: Panier): void {
    if (item.quantite > 1) {
      const key = this.getKey(item);
      this.panierService.updateQuantity(key, item.quantite - 1);
    }
  }

  removeItem(item: Panier): void {
    if (confirm('Retirer cette configuration du panier ?')) {
      this.panierService.removeFromCart(this.getKey(item));
    }
  }

  // ======================
  // PRIX
  // ======================

  getItemSubtotal(item: Panier): number {
    const configPrice = item.composants.reduce((s, c) => s + c.prix, 0);
    return configPrice * item.quantite;
  }

  // ======================
  //      CHECKOUT
  // ======================
  checkout(): void {
    if (this.panier().length === 0) {
      this.errorMessage = 'Votre panier est vide';
      return;
    }

    const user = this.authService.getUserInfo();
    if (!user) {
      this.errorMessage = 'Vous devez être connecté';
      return;
    }

    this.loading = true;

    const requests = this.panier().map(item => {
      if (!item.configuration.id) {
        throw new Error('Configuration non enregistrée en base');
      }

      return this.commandeService.createCommande({
        utilisateurId: user.id,
        configurationPcId: item.configuration.id,
        quantite: item.quantite
      });
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.panierService.clearCart();
        this.successMessage = 'Commande passée avec succès';
        this.loading = false;
        this.router.navigate(['/orders']);
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la commande';
        this.loading = false;
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/compo']);
  }

  selectConfig(config: ConfigurationComplete | null): void {
    this.selectedConfig.set(config);
    if (!config) return;

    const configuration: Configuration = {
      id: config.id,
      utilisateurId: config.utilisateurId,
      nomConfiguration: config.nomConfiguration,
      composantIds: config.composantIds
    };

    this.panierService.addToCart(configuration, config.composants);
  }



  // ======================
  // UTILS
  // ======================

  protected getKey(item: Panier): string {
    return [...item.configuration.composantIds].sort().join('-');
  }

  protected readonly isCaptureEventType = isCaptureEventType;
}

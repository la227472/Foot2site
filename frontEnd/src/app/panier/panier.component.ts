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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/dialogs/confirm-dialog/confirm-dialog.component';

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
// Le sous-total HT (Somme des composants)
subtotal = computed(() => this.panierService.getTotalPrice());

// Le montant de la TVA (21% du HT)
tvaAmount = computed(() => this.subtotal() * 0.21);

// Le total TTC des produits uniquement
totalTTCProducts = computed(() => this.subtotal() + this.tvaAmount());

// Livraison basée sur le prix HT (ou TTC selon ta politique, ici HT > 100)
shippingCost = computed(() => this.subtotal() > 100 ? 0 : 9.99);

// Le TOTAL FINAL (TTC produits + Livraison)
total = computed(() => this.totalTTCProducts() + this.shippingCost());

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private panierService: PanierService,
    private commandeService : CommandeService,
    private configService : ConfigurationService,
    private authService : ConnectionService,
    private router: Router,
    private dialog: MatDialog
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

  removeItem(item: Panier): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      hasBackdrop: true,
      data: {
        title: 'Retirer du panier',
        message: 'Êtes-vous sûr de vouloir retirer cette configuration du panier ?',
        composantName: item.configuration.nomConfiguration
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.panierService.removeFromCart(this.getKey(item));
      }
    });
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
        this.router.navigate(['/commandes']);
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

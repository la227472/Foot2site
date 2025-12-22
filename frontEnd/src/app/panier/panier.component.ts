import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PanierService } from '../Service/panier.service';
import { Panier } from '../Interface/Panier';
import {isCaptureEventType} from '@angular/core/primitives/event-dispatch';
import {forkJoin} from 'rxjs';
import {Commande} from '../Interface/Commande';
import {CommandeService} from '../Service/commande.service';
import {ConnectionComponent} from '../connection/connection.component';
import {ConnectionService} from '../Service/connection.service';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css'
})
export class PanierComponent {

  // 🔹 État panier
  panier = computed(() => this.panierService.panierItems());

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
    private authService : ConnectionService,
    private router: Router
  ) {}

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

  // ======================
  // UTILS
  // ======================

  protected getKey(item: Panier): string {
    return [...item.configuration.composantIds].sort().join('-');
  }

  protected readonly isCaptureEventType = isCaptureEventType;
}

import {Injectable, signal} from '@angular/core';
import {environment} from '../../Environement/environement';
import {HttpClient} from '@angular/common/http';
import {Panier} from '../Interface/Panier';
import {Composants} from '../Interface/Composants';
import {Configuration} from '../Interface/Configuration';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private apiUrl = environment.apiUrl;

  // État du panier en mémoire (signal)
  panierItems = signal<Panier[]>([]);

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  /**
   * Ajoute une configuration au panier
   */
  addToCart(configuration: Configuration, composants: Composants[]): void {
    const current = this.panierItems();

    // 🟢 Panier vide → on ajoute
    if (current.length === 0) {
      this.panierItems.set([
        { configuration, composants, quantite: 1 }
      ]);
      this.save();
      return;
    }

    const existing = current[0];

    // 🟢 Même configuration → on incrémente
    if (existing.configuration.id === configuration.id) {
      existing.quantite++;
      this.panierItems.set([...current]);
      this.save();
      return;
    }

    // 🔁 Configuration différente → ON REMPLACE
    this.panierItems.set([
      { configuration, composants, quantite: 1 }
    ]);
    this.save();
  }



  private save() {
    localStorage.setItem('cart', JSON.stringify(this.panierItems()));
  }

  removeFromCart(configurationKey: string): void {
    this.panierItems.set(
      this.panierItems().filter(
        i => this.getConfigurationKey(i.configuration) !== configurationKey
      )
    );
    this.saveCartToStorage();
  }

  getTotalPrice(): number {
    return this.panierItems().reduce((total, item) => {
      const configPrice = item.composants.reduce((s, c) => s + c.prix, 0);
      return total + configPrice * item.quantite;
    }, 0);
  }

  private getConfigurationKey(config: Configuration): string {
    return [...config.composantIds].sort().join('-');
  }

  /**
   * Ajoute un item au panier (local)
   */
  private addItemToCart(item: Panier): void {
    const currentCart = this.panierItems();

    const newKey = this.getConfigurationKey(item.configuration);

    const existingIndex = currentCart.findIndex(
      i => this.getConfigurationKey(i.configuration) === newKey
    );

    if (existingIndex >= 0) {
      currentCart[existingIndex].quantite++;
      this.panierItems.set([...currentCart]);
    } else {
      this.panierItems.set([...currentCart, item]);
    }

    this.saveCartToStorage();
  }

  /**
   * Met à jour la quantité
   */
  updateQuantity(configurationKey: string, quantite: number): void {
    const currentCart = this.panierItems();
    const index = currentCart.findIndex(
      i => this.getConfigurationKey(i.configuration) === configurationKey
    );

    if (index >= 0) {
      if (quantite <= 0) {
        this.removeFromCart(configurationKey);
      } else {
        currentCart[index].quantite = quantite;
        this.panierItems.set([...currentCart]);
        this.saveCartToStorage();
      }
    }
  }

  /**
   * Vide le panier
   */
  clearCart(): void {
    this.panierItems.set([]);
    localStorage.removeItem('cart');
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.panierItems.set(JSON.parse(saved));
    }
  }

  /**
   * Calcule le prix d'une configuration
   */
  private calculateConfigPrice(composants: Composants[]): number {
    return composants.reduce((sum, c) => sum + c.prix, 0);
  }

  /**
   * Sauvegarde le panier en localStorage
   */
  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.panierItems()));
  }

}

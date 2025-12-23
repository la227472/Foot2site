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
  addToCart(configuration: Configuration, composants: Composants[]) {
    const current = this.panierItems();
    const existing = current.find(
      i => i.configuration.id === configuration.id
    );

    if (existing) {
      existing.quantite++;
      this.panierItems.set([...current]);
    } else {
      this.panierItems.set([
        ...current,
        { configuration, composants, quantite: 1 }
      ]);
    }
    this.save();
  }

  private save() { this.saveCartToStorage(); }

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
    localStorage.removeItem(this.getCartKey());
    this.panierItems.set([]);
  }

  
  loadFromStorage() {
    const key = this.getCartKey();
    const saved = localStorage.getItem(key);
    this.panierItems.set(saved ? JSON.parse(saved) : []);
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
    localStorage.setItem(this.getCartKey(), JSON.stringify(this.panierItems()));
  }

private getCartKey(): string {
    const userStr = localStorage.getItem('current_user'); // La clé USER_KEY de ton service auth
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return `cart_user_${user.id}`;
      } catch (e) {
        return 'cart_guest';
      }
    }
    return 'cart_guest';
  }

}

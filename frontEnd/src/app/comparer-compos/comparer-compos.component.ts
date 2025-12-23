import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationService } from '../Service/configuration.service';
import { Configuration, ConfigurationComplete } from '../Interface/Configuration';
import { Subscription } from 'rxjs';
import { Composants } from '../Interface/Composants';
import { ConnectionService } from '../Service/connection.service';
import { PanierService } from '../Service/panier.service';
import Swal from 'sweetalert2'; // <--- IMPORTATION DE SWEETALERT

@Component({
  selector: 'app-comparer-compos',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './comparer-compos.component.html',
  styleUrl: './comparer-compos.component.css'
})
export class ComparerComposComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigurationService);
  private authService = inject(ConnectionService);
  private panierService = inject(PanierService);

  configurations: ConfigurationComplete[] = [];
  configGauche: ConfigurationComplete | null = null;
  configDroite: ConfigurationComplete | null = null;

  showDropdownLeft = false;
  showDropdownRight = false;
  isLoading = true;
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  // Mapping des icônes et labels
  readonly iconMapping: { [key in Composants['type']]: string } = {
    'CPU': 'memory', 'Motherboard': 'settings', 'GPU': 'videogame_asset',
    'Memory': 'view_headline', 'HardDisk': 'save', 'PSU': 'power', 'Box': 'inventory_2'
  };

  readonly typeLabels: { [key in Composants['type']]: string } = {
    'CPU': 'Processeur', 'Motherboard': 'Carte mère', 'GPU': 'Carte graphique',
    'Memory': 'Mémoire RAM', 'HardDisk': 'Disque dur', 'PSU': 'Alimentation', 'Box': 'Boîtier'
  };

  readonly typesComposants: Composants['type'][] = ['CPU', 'Motherboard', 'GPU', 'Memory', 'HardDisk', 'PSU', 'Box'];

  ngOnInit(): void {
    this.loadConfigurations();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConfigurations(): void {
    this.isLoading = true;
    const user = this.authService.currentUser();

    const sub = this.configService.getConfigurationsComplete().subscribe({
      next: (configs: any[]) => {
        if (user) {
          this.configurations = configs.filter(c => c.utilisateurId === user.id);
        } else {
          this.configurations = [];
          this.errorMessage = 'Veuillez vous connecter pour voir vos configurations.';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger les configurations.';
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  // ============== GESTION DES DROPDOWNS ==============

  toggleDropdown(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.showDropdownLeft = !this.showDropdownLeft;
      this.showDropdownRight = false;
    } else {
      this.showDropdownRight = !this.showDropdownRight;
      this.showDropdownLeft = false;
    }
  }

  selectConfig(config: ConfigurationComplete | null, side: 'left' | 'right'): void {
    if (side === 'left') {
      this.configGauche = config;
      this.showDropdownLeft = false;
    } else {
      this.configDroite = config;
      this.showDropdownRight = false;
    }
  }

  // ============== GESTION DES COMPOSANTS ==============

  getComposantByType(config: ConfigurationComplete | null, type: Composants['type']): Composants | undefined {
    if (!config) return undefined;
    return config.composants.find(c => c.type === type);
  }

  getTypeLabel(type: Composants['type']): string {
    return this.typeLabels[type] || type;
  }

  getIcon(type: Composants['type']): string {
    return this.iconMapping[type] || 'help_outline';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  getScoreClass(score: number): string {
    if (score < 50) return 'score-red';
    if (score < 70) return 'score-orange';
    return 'score-green';
  }

  // ============== ACTIONS AVEC SWEETALERT ==============

  ajouterAuPanier(configComplete: ConfigurationComplete | null): void {
    if (!configComplete) {
      Swal.fire({
        icon: 'error',
        title: 'Oups...',
        text: 'Veuillez sélectionner une configuration.',
        confirmButtonColor: '#313761'
      });
      return;
    }

    // Vérification de la disponibilité (Si ton service le gère)
    const isDisponible = this.configService.verifierDisponibilite(configComplete);
    if (!isDisponible) {
        Swal.fire({
            icon: 'warning',
            title: 'Indisponible',
            text: 'Certains composants ne sont plus en stock.',
            confirmButtonColor: '#313761'
        });
        return;
    }

    // Mapping et Ajout
    const configBase: Configuration = {
      id: configComplete.id,
      nomConfiguration: configComplete.nomConfiguration,
      utilisateurId: configComplete.utilisateurId,
      composantIds: configComplete.composants.map(c => c.id)
    };

    this.panierService.addToCart(configBase, configComplete.composants);

    // POPUP DE SUCCÈS
    Swal.fire({
      icon: 'success',
      title: 'Ajouté !',
      html: `La configuration <b>${configComplete.nomConfiguration}</b> est dans votre panier.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true // Mode "Toast" pour ne pas bloquer l'utilisateur au milieu de l'écran
    });
  }

  comparerConfigurations(): void {
    if (!this.configGauche || !this.configDroite) {
      Swal.fire({
        icon: 'info',
        title: 'Information',
        text: 'Sélectionnez deux configurations pour comparer.',
        confirmButtonColor: '#313761'
      });
      return;
    }

    const comparaison = this.configService.comparerConfigurations(this.configGauche, this.configDroite);

    // POPUP DE COMPARAISON DÉTAILLÉE
    Swal.fire({
      title: 'Résultat de la comparaison',
      background: '#fff',
      color: '#313761',
      confirmButtonColor: '#313761',
      html: `
        <div style="text-align: left; font-size: 0.9rem;">
          <p>💰 <b>Différence de prix :</b> ${comparaison.differencePrix.toFixed(2)} €</p>
          <p>📈 <b>Différence de score :</b> ${comparaison.differenceScore} pts</p>
          <hr>
          <p>✅ <b>Meilleur prix :</b> ${comparaison.meilleurPrix.nomConfiguration}</p>
          <p>🚀 <b>Meilleur score :</b> ${comparaison.meilleurScore.nomConfiguration}</p>
          <p>💎 <b>Meilleur rapport Q/P :</b> ${comparaison.meilleurRapportQualitePrix.nomConfiguration}</p>
        </div>
      `
    });
  }
}
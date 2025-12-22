import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationService } from '../Service/configuration.service';
import { ConfigurationComplete } from '../Interface/Configuration';
import { Subscription } from 'rxjs';
import { Composants } from '../Interface/Composants';
import { ConnectionService } from '../Service/connection.service';

@Component({
  selector: 'app-comparer-compos',
  standalone: true, // Important en Angular moderne
  imports: [CommonModule, MatIconModule],
  templateUrl: './comparer-compos.component.html',
  styleUrl: './comparer-compos.component.css'
})
export class ComparerComposComponent implements OnInit {
  // Services injectés via inject() pour la modernité ou via constructeur
  private configService = inject(ConfigurationService);
  private authService = inject(ConnectionService);

  configurations: ConfigurationComplete[] = [];
  configGauche: ConfigurationComplete | null = null;
  configDroite: ConfigurationComplete | null = null;

  showDropdownLeft = false;
  showDropdownRight = false;
  isLoading = true;
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  // ... Mapping des icônes et labels (inchangé) ...
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

  // ============== CHARGEMENT DES DONNÉES FILTRÉES ==============

  loadConfigurations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // On récupère l'utilisateur en session
    const user = this.authService.currentUser();

    const sub = this.configService.getConfigurationsComplete().subscribe({
      next: (configs: any[]) => {
        if (user) {
          // FILTRAGE : On ne garde que les configs de l'utilisateur connecté
          this.configurations = configs.filter(c => c.utilisateurId === user.id);
          console.log(`${this.configurations.length} config(s) de l'utilisateur ${user.firstname} chargée(s)`);
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

  /**
   * Sélectionne automatiquement les configurations par défaut
   */
  private selectDefaultConfigurations(configs: ConfigurationComplete[]): void {
    if (configs.length > 0) {
      this.configGauche = configs[0];
    }
    if (configs.length > 1) {
      this.configDroite = configs[1];
    }
  }

  /**
   * Recharge les configurations
   */
  refresh(): void {
    this.loadConfigurations();
  }

  // ============== GESTION DES DROPDOWNS ==============

  /**
   * Affiche/masque le dropdown de sélection
   */
  toggleDropdown(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.showDropdownLeft = !this.showDropdownLeft;
      this.showDropdownRight = false;
    } else {
      this.showDropdownRight = !this.showDropdownRight;
      this.showDropdownLeft = false;
    }
  }

  /**
   * Sélectionne une configuration dans le dropdown
   */
  // Dans votre comparer-compos.component.ts
selectConfig(config: ConfigurationComplete | null, side: 'left' | 'right'): void {
  if (side === 'left') {
    this.configGauche = config;
    this.showDropdownLeft = false;
  } else {
    this.configDroite = config;
    this.showDropdownRight = false;
  }
}

  /**
   * Ferme tous les dropdowns (peut être appelé sur un clic extérieur)
   */
  closeAllDropdowns(): void {
    this.showDropdownLeft = false;
    this.showDropdownRight = false;
  }

  // ============== GESTION DES COMPOSANTS ==============

  /**
   * Récupère un composant par type dans une configuration
   */
  getComposantByType(config: ConfigurationComplete | null, type: Composants['type']): Composants | undefined {
    if (!config) return undefined;
    return config.composants.find(c => c.type === type);
  }

  /**
   * Vérifie si un composant de ce type existe dans la configuration
   */
  hasComposant(config: ConfigurationComplete | null, type: Composants['type']): boolean {
    return !!this.getComposantByType(config, type);
  }

  /**
   * Compte le nombre de composants dans une configuration
   */
  getComposantsCount(config: ConfigurationComplete | null): number {
    return config?.composants.length || 0;
  }

  // ============== HELPERS D'AFFICHAGE ==============

  /**
   * Récupère l'icône Material correspondant au type
   */
  getIcon(type: Composants['type']): string {
    return this.iconMapping[type] || 'help_outline';
  }

  /**
   * Récupère le label français du type de composant
   */
  getTypeLabel(type: Composants['type']): string {
    return this.typeLabels[type] || type;
  }

  /**
   * Formate le prix avec 2 décimales
   */
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // ============== VALIDATIONS ==============

  /**
   * Vérifie si la configuration est disponible (tous les composants en stock)
   */
  isConfigurationDisponible(config: ConfigurationComplete | null): boolean {
    if (!config) return false;
    return this.configService.verifierDisponibilite(config);
  }

  /**
   * Vérifie si la configuration est complète (tous les types requis présents)
   */
  isConfigurationComplete(config: ConfigurationComplete | null): boolean {
    if (!config) return false;
    return this.configService.isConfigurationComplete(config, this.typesComposants);
  }

  /**
   * Obtient les types de composants manquants
   */
  getComposantsManquants(config: ConfigurationComplete | null): Composants['type'][] {
    if (!config) return this.typesComposants;
    return this.configService.getComposantsManquants(config, this.typesComposants);
  }

  /**
   * Obtient les labels français des composants manquants
   */
  getComposantsManquantsLabels(config: ConfigurationComplete | null): string[] {
    const manquants = this.getComposantsManquants(config);
    return manquants.map(type => this.getTypeLabel(type));
  }

  // ============== COMPARAISON ==============

  /**
   * Compare les deux configurations sélectionnées
   */
  comparerConfigurations(): void {
    if (!this.configGauche || !this.configDroite) {
      console.warn('Deux configurations doivent être sélectionnées pour comparer');
      return;
    }

    const comparaison = this.configService.comparerConfigurations(
      this.configGauche, 
      this.configDroite
    );

    console.log('Résultat de la comparaison:', comparaison);

    // Vous pouvez afficher les résultats dans une modal ou un alert
    const message = `
      Différence de prix: ${comparaison.differencePrix.toFixed(2)} €
      Différence de score: ${comparaison.differenceScore}
      Meilleur prix: ${comparaison.meilleurPrix.nomConfiguration}
      Meilleur score: ${comparaison.meilleurScore.nomConfiguration}
      Meilleur rapport qualité/prix: ${comparaison.meilleurRapportQualitePrix.nomConfiguration}
    `;

    alert(message);
  }

  // ============== ACTIONS ==============

  /**
   * Ajoute une configuration au panier
   */
  ajouterAuPanier(config: ConfigurationComplete | null): void {
    if (!config) {
      alert('Veuillez sélectionner une configuration.');
      return;
    }

    // Vérifier la disponibilité
    if (!this.isConfigurationDisponible(config)) {
      const message = 'Certains composants de cette configuration ne sont plus en stock.';
      console.warn(message, config);
      alert(message);
      return;
    }

    // Vérifier que la configuration est complète
    const manquants = this.getComposantsManquantsLabels(config);
    if (manquants.length > 0) {
      const message = `Configuration incomplète.\nComposants manquants:\n- ${manquants.join('\n- ')}`;
      console.warn(message, config);
      alert(message);
      return;
    }

    // Log pour debug
    console.log('Ajout au panier:', {
      id: config.id,
      nom: config.nomConfiguration,
      composants: config.composants.length,
      prixTotal: config.prixTotal,
      scoreMoyen: config.scoreMoyen
    });

    // TODO: Implémenter l'appel à votre service de panier
    // Exemple: this.panierService.ajouterConfiguration(config);
    
    const message = `Configuration "${config.nomConfiguration}" ajoutée au panier !\n\n` +
                   `${config.composants.length} composants\n` +
                   `Total: ${this.formatPrice(config.prixTotal)} €\n` +
                   `Score moyen: ${config.scoreMoyen}`;
    
    alert(message);
  }

  // ============== HELPERS ==============

  /**
   * Vérifie si des configurations sont chargées
   */
  hasConfigurations(): boolean {
    return this.configurations.length > 0;
  }

  /**
   * Vérifie si les deux configurations sont sélectionnées
   */
  hasBothConfigurations(): boolean {
    return this.configGauche !== null && this.configDroite !== null;
  }


  // À ajouter dans votre classe ComparerComposComponent
getScoreClass(score: number): string {
  if (score < 50) return 'score-red';
  if (score < 70) return 'score-orange';
  return 'score-green';
}
}
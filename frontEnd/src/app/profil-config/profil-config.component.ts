import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationComplete } from '../Interface/Configuration';
import { ConfigurationService } from '../Service/configuration.service';
import { ConnectionService } from '../Service/connection.service';
import { CommonModule } from '@angular/common';
import { Composants } from '../Interface/Composants';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profil-config',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './profil-config.component.html',
  styleUrl: './profil-config.component.css'
})
export class ProfilConfigComponent implements OnInit {
  configurations: ConfigurationComplete[] = [];
  expandedConfigId: number | null = null;
  isLoading = true;

  // --- AJOUT PAGINATION ---
  currentPage = 1;
  itemsPerPage = 5;

  // Découpe la liste pour la page actuelle
  get paginatedConfigs() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.configurations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.configurations.length / this.itemsPerPage));
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Injection des services
  private configService = inject(ConfigurationService);
  public authService = inject(ConnectionService);

  ngOnInit(): void {
    this.loadUserConfigs();
  }

  loadUserConfigs(): void {
    this.isLoading = true;
    const user = this.authService.currentUser();

    if (!user) {
      this.isLoading = false;
      return;
    }

    this.configService.getConfigurationsComplete().subscribe({
      next: (configs) => {
        // Utiliser le spread [...] pour forcer le rafraîchissement
        const filtered = configs.filter(c => c.utilisateurId === user.id);
        this.configurations = [...filtered]; 
        this.currentPage = 1; // Reset à la page 1
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleExpand(configId: number | undefined): void {
    if (configId === undefined) return;

    if (this.expandedConfigId === configId) {
      this.expandedConfigId = null; 
    } else {
      this.expandedConfigId = configId;
    }
  }

  getScoreClass(score: number | undefined | null): string {
    if (score === undefined || score === null) return 'score-red';
    if (score < 50) return 'score-red';
    if (score < 70) return 'score-orange';
    return 'score-green';
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.expandedConfigId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteConfig(event: MouseEvent, config: any): void {
  event.stopPropagation(); // Toujours important pour l'accordéon

    Swal.fire({
      title: 'Supprimer la configuration ?',
      text: `Voulez-vous vraiment supprimer "${config.nomConfiguration}" ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f', 
      cancelButtonColor: '#313761',  
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      reverseButtons: true, 
      customClass: {
        popup: 'swal-custom-radius' 
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur a cliqué sur "Oui"
        this.configService.deleteConfiguration(config.id).subscribe({
          next: () => {
            // Mise à jour de la liste locale
            this.configurations = this.configurations.filter(c => c.id !== config.id);
            
            // Petit toast de confirmation en haut à droite
            Swal.fire({
              title: 'Supprimé !',
              text: 'Votre configuration a été supprimée.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          },
          error: (err) => {
            Swal.fire('Erreur', 'Impossible de supprimer la configuration.', 'error');
          }
        });
      }
    });
  }

  removeComponent(config: ConfigurationComplete, comp: Composants): void {
  // On construit le nom complet (Marque + Modèle)
  const compFullName = `${comp.marque} ${comp.modele}`;

  Swal.fire({
    title: 'Retirer ce composant ?',
    // On insère le nom du composant dynamiquement dans le texte
    html: `Voulez-vous vraiment retirer <b>${compFullName}</b> de votre configuration ?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff4d4f',
    confirmButtonText: 'Oui, supprimer !',
    cancelButtonText: 'Annuler',
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-radius'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      
      const newComposantIds = config.composantIds.filter(id => id !== comp.id);

      const updatedConfig = {
        id: config.id,
        nomConfiguration: config.nomConfiguration,
        utilisateurId: config.utilisateurId,
        composantIds: newComposantIds
      };

      this.configService.updateConfiguration(config.id!, updatedConfig).subscribe({
        next: () => {
          config.composants = config.composants.filter(c => c.id !== comp.id);
          config.composantIds = newComposantIds;
          config.prixTotal = config.composants.reduce((sum, c) => sum + (c.prix || 0), 0);

          Swal.fire({
            title: 'Composant retiré',
            text: `${compFullName} a été supprimé avec succès.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 2500,
            showConfirmButton: false
          });
        },
        error: () => Swal.fire('Erreur', 'Impossible de mettre à jour la configuration.', 'error')
      });
    }
  });
}
}
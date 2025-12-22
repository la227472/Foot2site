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

  // Injection des services
  private configService = inject(ConfigurationService);
  public authService = inject(ConnectionService);

  ngOnInit(): void {
    this.loadUserConfigs();
  }

  loadUserConfigs(): void {
    this.isLoading = true;
    
    // Récupération de l'utilisateur actuellement connecté via le signal
    const user = this.authService.currentUser();

    if (!user) {
      this.isLoading = false;
      console.warn("Aucun utilisateur connecté.");
      return;
    }

    this.configService.getConfigurationsComplete().subscribe({
      next: (configs) => {
        // FILTRAGE : On garde uniquement les configs appartenant à l'utilisateur connecté
        this.configurations = configs.filter(c => c.utilisateurId === user.id);
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

  deleteConfig(event: MouseEvent, config: any): void {
  event.stopPropagation(); // Toujours important pour l'accordéon

    Swal.fire({
      title: 'Supprimer la configuration ?',
      text: `Voulez-vous vraiment supprimer "${config.nomConfiguration}" ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f', // Le rouge de votre bouton
      cancelButtonColor: '#313761',  // Le bleu de votre sidebar
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      reverseButtons: true, // Met "Annuler" à gauche
      customClass: {
        popup: 'swal-custom-radius' // On peut ajouter une classe pour arrondir les coins
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
      // Le reste de la logique reste le même, on utilise comp.id pour le filtre
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
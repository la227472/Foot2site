import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { GererUsersService } from '../Service/gerer-users.service';
import { ConnectionService } from '../Service/connection.service';
import { Utilisateur } from '../Interface/Utilisateur';
import { EditUserDialogComponent } from './edit-user-dialog.component';

@Component({
  selector: 'app-gerer-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './gerer-users.component.html',
  styleUrls: ['./gerer-users.component.css']
})
export class GererUsersComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  isLoading = false;
  searchTerm = '';

  constructor(
    private gererUsersService: GererUsersService,
    private connectionService: ConnectionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
    this.loadUtilisateurs();
  }

  /**
   * Vérifie si l'utilisateur connecté est admin
   */
  checkAdminAccess() {
    if (!this.connectionService.isAdmin()) {
      this.snackBar.open('Accès refusé : vous devez être administrateur', 'Fermer', { duration: 3000 });
      this.router.navigate(['/accueil']);
    }
  }

  /**
   * Charge la liste de tous les utilisateurs
   */
  loadUtilisateurs() {
    this.isLoading = true;
    this.gererUsersService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.filteredUtilisateurs = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtre les utilisateurs en fonction de la recherche
   */
  onSearch() {
    this.filteredUtilisateurs = this.gererUsersService.searchUtilisateurs(this.searchTerm, this.utilisateurs);
  }

  /**
   * Ouvre la popup de modification de l'utilisateur
   */
  editUtilisateur(id: number) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { userId: id },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si la modification a réussi, recharger la liste
        this.loadUtilisateurs();
      }
    });
  }

  /**
   * Affiche les détails d'un utilisateur
   */
  viewUtilisateur(utilisateur: Utilisateur) {
    // Afficher les détails dans un snackbar ou une modale
    const details = `
      Nom: ${utilisateur.nom}
      Prénom: ${utilisateur.prenom}
      Email: ${utilisateur.email}
      Adresse: ${utilisateur.adresse?.Rue || 'N/A'} ${utilisateur.adresse?.Numero || ''}, ${utilisateur.adresse?.Code || ''}
      Rôles: ${utilisateur.roles?.join(', ') || 'Aucun'}
    `;
    alert(details);
  }

  /**
   * Supprime un utilisateur après confirmation
   */
  deleteUtilisateur(utilisateur: Utilisateur) {
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${utilisateur.prenom} ${utilisateur.nom} ?`);

    if (confirmation && utilisateur.id) {
      this.isLoading = true;
      this.gererUsersService.deleteUtilisateur(utilisateur.id).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadUtilisateurs(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Vérifie si un utilisateur a le rôle Admin
   */
  isUserAdmin(user: Utilisateur): boolean {
    if (!user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some(role => role.toLowerCase() === 'admin');
  }

  /**
   * Retourne à l'accueil
   */
  goBack() {
    this.router.navigate(['/accueil']);
  }
}

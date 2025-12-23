import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ModifierProfilService } from '../Service/modifier-profil.service';
import { AdresseService } from '../Service/adresse.service';
import { ConnectionService } from '../Service/connection.service';
import { Utilisateur, UpdateUtilisateurRequest } from '../Interface/Utilisateur';
import { Adress } from '../Interface/Adress';

@Component({
  selector: 'app-modifier-profil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './modifier-profil.component.html',
  styleUrls: ['./modifier-profil.component.css']
})
export class ModifierProfilComponent implements OnInit {
  profilForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  utilisateurId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private modifierProfilService: ModifierProfilService,
    private adresseService: AdresseService,
    private connectionService: ConnectionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profilForm = this.fb.group({
      nom: ['', [Validators.minLength(2)]],
      prenom: ['', [Validators.minLength(2)]],
      email: ['', [Validators.email]],
      password: [''],
      rue: [''],
      numero: ['', [Validators.pattern('^[0-9]+$')]],
      codePostal: ['', [Validators.pattern('^[0-9]{4}$')]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  /**
   * Charge le profil de l'utilisateur connecté depuis le token JWT
   */
  loadUserProfile() {
    const userInfo = this.connectionService.getUserInfo();

    if (!userInfo || !userInfo.id) {
      this.snackBar.open('Utilisateur non connecté', 'Fermer', { duration: 3000 });
      this.router.navigate(['/connection']);
      return;
    }

    this.utilisateurId = parseInt(userInfo.id);
    this.isLoading = true;

    this.modifierProfilService.getUtilisateur(this.utilisateurId).subscribe({
      next: (utilisateur: Utilisateur) => {
        this.patchFormWithUserData(utilisateur);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Remplit le formulaire avec les données de l'utilisateur
   */
  patchFormWithUserData(utilisateur: Utilisateur) {
    this.profilForm.patchValue({
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      rue: utilisateur.adresse?.Rue || '',
      numero: utilisateur.adresse?.Numero || '',
      codePostal: utilisateur.adresse?.Code || ''
    });
  }

  /**
   * Soumet le formulaire de modification du profil
   */
  onSubmit() {
    if (this.profilForm.invalid || !this.utilisateurId) {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formValue = this.profilForm.value;

    // D'abord, récupérer l'utilisateur actuel
    this.modifierProfilService.getUtilisateur(this.utilisateurId).subscribe({
      next: (utilisateur: Utilisateur) => {
        // Vérifier si des champs d'adresse ont été modifiés
        const hasAddressChanges =
          (formValue.rue && formValue.rue.trim() !== '') ||
          (formValue.numero && formValue.numero.toString().trim() !== '') ||
          (formValue.codePostal && formValue.codePostal.toString().trim() !== '');

        if (hasAddressChanges) {
          // Gérer la mise à jour de l'adresse
          this.handleAddressUpdate(utilisateur, formValue);
        } else {
          // Pas de modification d'adresse, mettre à jour uniquement l'utilisateur
          this.updateUtilisateur(utilisateur, utilisateur.adresseId || 0);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        this.snackBar.open('Erreur lors de la récupération des données', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Gère la mise à jour de l'adresse
   */
  private handleAddressUpdate(utilisateur: Utilisateur, formValue: any) {
    const adresseId = utilisateur.adresseId;

    // Construire l'objet adresse avec les valeurs existantes ou nouvelles
    const adresseData: Adress = {
      id: adresseId,
      Rue: formValue.rue && formValue.rue.trim() !== '' ? formValue.rue : utilisateur.adresse?.Rue || '',
      Numero: formValue.numero && formValue.numero.toString().trim() !== '' ? parseInt(formValue.numero) : utilisateur.adresse?.Numero || 0,
      Code: formValue.codePostal && formValue.codePostal.toString().trim() !== '' ? parseInt(formValue.codePostal) : utilisateur.adresse?.Code || 0
    };

    if (adresseId) {
      // Mettre à jour l'adresse existante
      this.adresseService.updateAdresse(adresseId, adresseData).subscribe({
        next: () => {
          this.updateUtilisateur(utilisateur, adresseId);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'adresse:', error);
          this.snackBar.open('Erreur lors de la mise à jour de l\'adresse', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      // Créer une nouvelle adresse seulement si tous les champs sont renseignés
      if (adresseData.Rue && adresseData.Numero && adresseData.Code) {
        const newAdresse: Adress = {
          Rue: adresseData.Rue,
          Numero: adresseData.Numero,
          Code: adresseData.Code
        };

        this.adresseService.createAdresse(newAdresse).subscribe({
          next: (createdAdresse) => {
            this.updateUtilisateur(utilisateur, createdAdresse.id!);
          },
          error: (error) => {
            console.error('Erreur lors de la création de l\'adresse:', error);
            this.snackBar.open('Erreur lors de la création de l\'adresse', 'Fermer', { duration: 3000 });
            this.isLoading = false;
          }
        });
      } else {
        this.snackBar.open('Veuillez remplir tous les champs de l\'adresse pour la créer', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    }
  }

  /**
   * Met à jour les informations de l'utilisateur
   */
  private updateUtilisateur(utilisateur: Utilisateur, adresseId: number) {
    const formValue = this.profilForm.value;

    // Construire l'objet de mise à jour avec les valeurs modifiées ou existantes
    const updateData: UpdateUtilisateurRequest = {
      id: this.utilisateurId!,
      nom: formValue.nom && formValue.nom.trim() !== '' ? formValue.nom : utilisateur.nom,
      prenom: formValue.prenom && formValue.prenom.trim() !== '' ? formValue.prenom : utilisateur.prenom,
      email: formValue.email && formValue.email.trim() !== '' ? formValue.email : utilisateur.email,
      adresseId: adresseId,
      roles: utilisateur.roles || []
    };

    // Ajouter le mot de passe seulement s'il est renseigné
    if (formValue.password && formValue.password.trim() !== '') {
      updateData.motDePasse = formValue.password;
    }

    this.modifierProfilService.updateProfil(this.utilisateurId!, updateData).subscribe({
      next: () => {
        this.snackBar.open('Profil mis à jour avec succès !', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.profilForm.patchValue({ password: '' });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.snackBar.open('Erreur lors de la mise à jour du profil', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Annule la modification et retourne à l'accueil
   */
  onCancel() {
    this.router.navigate(['/accueil']);
  }
}

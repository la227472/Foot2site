import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ModifierProfilService } from '../Service/modifier-profil.service';
import { AdresseService } from '../Service/adresse.service';
import { ConnectionService, CurrentUser, Adress } from '../Service/connection.service';

@Component({
  selector: 'app-modifier-profil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './modifier-profil.component.html',
  styleUrls: ['./modifier-profil.component.css']
})
export class ModifierProfilComponent implements OnInit {
  profilForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  utilisateurId: number | null = null;
  adresseActuelle: Adress | null = null;

  constructor(
    private fb: FormBuilder,
    private modifierProfilService: ModifierProfilService,
    private adresseService: AdresseService,
    private connectionService: ConnectionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profilForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rue: ['', Validators.required],
      numero: ['', [Validators.required]],
      codePostal: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userInfo = this.connectionService.getUserInfo();
    if (!userInfo || !userInfo.id) {
      this.router.navigate(['/connection']);
      return;
    }

    this.utilisateurId = parseInt(userInfo.id);
    this.isLoading = true;

    this.modifierProfilService.getUtilisateur(this.utilisateurId).subscribe({
      next: (data: any) => {
        this.profilForm.patchValue({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email
        });

        if (data.adresseId) {
          this.adresseService.getAdresse(data.adresseId).subscribe({
            next: (addr: any) => {
              this.adresseActuelle = {
                id: addr.id || addr.Id,
                Rue: (addr.Rue || addr.rue || '').toString().trim(),
                Numero: Number(addr.Numero || addr.numero),
                Code: Number(addr.Code || addr.code || addr.codePostal)
              };
              this.profilForm.patchValue({
                rue: this.adresseActuelle.Rue,
                numero: this.adresseActuelle.Numero,
                codePostal: this.adresseActuelle.Code
              });
              this.isLoading = false;
            },
            error: (err) => {
              this.isLoading = false;
              if (err.status === 401) {
                this.snackBar.open('Votre session a expiré. Veuillez vous reconnecter.', 'OK', { duration: 5000 });
                this.connectionService.logout();
              }
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.snackBar.open('Votre session a expiré. Veuillez vous reconnecter.', 'OK', { duration: 5000 });
          this.connectionService.logout();
        } else {
          this.handleError("Erreur chargement profil");
        }
      }
    });
  }

  onSubmit() {
    if (this.profilForm.invalid || !this.utilisateurId) return;

    this.isLoading = true;
    const formValue = this.profilForm.value;

    this.modifierProfilService.getUtilisateur(this.utilisateurId).subscribe({
      next: (userBackend: any) => {
        const aChange = this.checkIfAddressChanged(formValue);

        if (aChange) {
          this.adresseService.getAdresses().subscribe({
            next: (allAdresses: Adress[]) => {
              const rueSaisie = formValue.rue.trim().toLowerCase();
              const numSaisi = Number(formValue.numero);
              const codeSaisi = Number(formValue.codePostal);

              // RECHERCHE AMÉLIORÉE : On normalise les données venant de la DB aussi
              const existingAddr = allAdresses.find(a => {
                const rueDB = (a.Rue || (a as any).rue || '').toString().trim().toLowerCase();
                const numDB = Number(a.Numero || (a as any).numero);
                const codeDB = Number(a.Code || (a as any).code || (a as any).codePostal);
                return rueDB === rueSaisie && numDB === numSaisi && codeDB === codeSaisi;
              });

              if (existingAddr) {
                // CORRECTION MAJEURE : On vérifie id ET Id
                const idTrouve = existingAddr.id || (existingAddr as any).Id;
                console.log("Adresse existante trouvée ! ID utilisé :", idTrouve);
                this.updateUtilisateurFinal(userBackend, formValue, idTrouve);
              } else {
                console.log("Nouvelle adresse : création...");
                const nouvelleAdresse: Adress = {
                  Rue: formValue.rue.trim(),
                  Numero: Number(formValue.numero),
                  Code: Number(formValue.codePostal)
                };
                this.adresseService.createAdresse(nouvelleAdresse).subscribe({
                  next: (created: any) => {
                    const newId = created.id || created.Id;
                    this.updateUtilisateurFinal(userBackend, formValue, newId);
                  },
                  error: () => this.handleError("Erreur création adresse")
                });
              }
            },
            error: () => this.handleError("Erreur lors de la vérification")
          });
        } else {
          this.updateUtilisateurFinal(userBackend, formValue, userBackend.adresseId);
        }
      },
      error: () => this.handleError("Erreur de synchronisation")
    });
  }

  private checkIfAddressChanged(formValue: any): boolean {
    if (!this.adresseActuelle) return true;
    return (
      formValue.rue.trim().toLowerCase() !== this.adresseActuelle.Rue.toLowerCase() ||
      Number(formValue.numero) !== this.adresseActuelle.Numero ||
      Number(formValue.codePostal) !== this.adresseActuelle.Code
    );
  }

  private updateUtilisateurFinal(oldData: any, formValue: any, adresseId: number) {
    const updateData: any = {
      id: this.utilisateurId,
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      adresseId: adresseId,
      roles: oldData.roles,
      motDePasse: (formValue.password && formValue.password.trim() !== '')
                  ? formValue.password
                  : oldData.motDePasse
    };

    this.modifierProfilService.updateProfil(this.utilisateurId!, updateData).subscribe({
      next: () => {
        this.snackBar.open('Profil mis à jour !', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.profilForm.patchValue({ password: '' });

        // Recharger les données utilisateur avec gestion d'erreur
        this.connectionService.loadCurrentUser().subscribe({
          next: () => {
            this.loadUserProfile();
          },
          error: (err) => {
            console.error('Erreur lors du rechargement du profil:', err);
            // Si erreur 401, la session a expiré
            if (err.status === 401) {
              this.snackBar.open('Votre session a expiré. Veuillez vous reconnecter.', 'OK', { duration: 5000 });
              this.connectionService.logout();
            } else {
              // Pour les autres erreurs, simplement recharger la page
              this.loadUserProfile();
            }
          }
        });
      },
      error: (err) => {
        // Gestion spécifique pour erreur 401
        if (err.status === 401) {
          this.snackBar.open('Votre session a expiré. Veuillez vous reconnecter.', 'OK', { duration: 5000 });
          this.connectionService.logout();
        } else {
          this.handleError("Erreur mise à jour profil");
        }
      }
    });
  }

  private handleError(msg: string) {
    this.snackBar.open(msg, 'Fermer', { duration: 3000 });
    this.isLoading = false;
  }

  onCancel() {
    this.router.navigate(['/profil']);
  }
}
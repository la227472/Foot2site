import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ModifierProfilService } from '../Service/modifier-profil.service';
import { AdresseService } from '../Service/adresse.service';
import { Utilisateur } from '../Interface/Utilisateur';
import { Adress } from '../Interface/Adress';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>
          <mat-icon>edit</mat-icon>
          Modifier l'utilisateur
        </h2>
        <button class="close-button" (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-spinner">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des données...</p>
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
        <div class="dialog-content">
          <div class="form-section">
            <div class="section-title">
              <mat-icon>person</mat-icon>
              <span>Informations personnelles</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="nom">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  [class.error]="userForm.get('nom')?.invalid && userForm.get('nom')?.touched"
                  placeholder="Nom de famille">
                <span class="error-message" *ngIf="userForm.get('nom')?.invalid && userForm.get('nom')?.touched">
                  Le nom est requis
                </span>
              </div>

              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  [class.error]="userForm.get('prenom')?.invalid && userForm.get('prenom')?.touched"
                  placeholder="Prénom">
                <span class="error-message" *ngIf="userForm.get('prenom')?.invalid && userForm.get('prenom')?.touched">
                  Le prénom est requis
                </span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                  placeholder="exemple@email.com">
                <span class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                  Email valide requis
                </span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="password">Mot de passe</label>
                <div class="password-wrapper">
                  <input
                    id="password"
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Laisser vide pour ne pas modifier">
                  <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">
              <mat-icon>home</mat-icon>
              <span>Adresse</span>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="rue">Rue *</label>
                <input
                  id="rue"
                  type="text"
                  formControlName="rue"
                  [class.error]="userForm.get('rue')?.invalid && userForm.get('rue')?.touched"
                  placeholder="Nom de la rue">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="numero">Numéro *</label>
                <input
                  id="numero"
                  type="text"
                  formControlName="numero"
                  [class.error]="userForm.get('numero')?.invalid && userForm.get('numero')?.touched"
                  placeholder="N°">
              </div>

              <div class="form-group">
                <label for="codePostal">Code Postal *</label>
                <input
                  id="codePostal"
                  type="text"
                  formControlName="codePostal"
                  [class.error]="userForm.get('codePostal')?.invalid && userForm.get('codePostal')?.touched"
                  placeholder="Code postal">
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="isLoading">
            <mat-icon>close</mat-icon>
            <span>Annuler</span>
          </button>
          <button type="submit" class="btn-save" [disabled]="userForm.invalid || isLoading">
            <mat-icon>save</mat-icon>
            <span>{{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 2px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .dialog-header h2 mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      color: #666;
    }

    .close-button:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    .close-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 20px;
    }

    .loading-spinner p {
      color: #666;
      font-size: 14px;
    }

    .dialog-content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #4a5a8a;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-title mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    }

    .form-group input {
      padding: 12px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.3s;
      font-family: inherit;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error {
      border-color: #f44336;
    }

    .form-group input::placeholder {
      color: #999;
    }

    .error-message {
      font-size: 0.85rem;
      color: #f44336;
      margin-top: 4px;
    }

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-wrapper input {
      flex: 1;
      padding-right: 48px;
    }

    .toggle-password {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .toggle-password:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    .toggle-password mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 2px solid #e0e0e0;
      background-color: #f9f9f9;
    }

    .btn-cancel,
    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      font-family: inherit;
    }

    .btn-cancel {
      background-color: #f5f5f5;
      color: #666;
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn-save {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-cancel:disabled,
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-cancel mat-icon,
    .btn-save mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        max-width: 100vw;
        max-height: 100vh;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .dialog-actions {
        flex-direction: column-reverse;
      }

      .btn-cancel,
      .btn-save {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EditUserDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  adresseActuelle: Adress | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private modifierProfilService: ModifierProfilService,
    private adresseService: AdresseService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
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
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;

    this.modifierProfilService.getUtilisateur(this.data.userId).subscribe({
      next: (user: any) => {
        this.userForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email
        });

        if (user.adresseId) {
          this.adresseService.getAdresse(user.adresseId).subscribe({
            next: (addr: any) => {
              this.adresseActuelle = {
                id: addr.id || addr.Id,
                Rue: (addr.Rue || addr.rue || '').toString().trim(),
                Numero: Number(addr.Numero || addr.numero),
                Code: Number(addr.Code || addr.code || addr.codePostal)
              };
              this.userForm.patchValue({
                rue: this.adresseActuelle.Rue,
                numero: this.adresseActuelle.Numero,
                codePostal: this.adresseActuelle.Code
              });
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erreur lors du chargement de l\'adresse', 'Fermer', { duration: 3000 });
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.dialogRef.close();
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const formValue = this.userForm.value;

    this.modifierProfilService.getUtilisateur(this.data.userId).subscribe({
      next: (userBackend: any) => {
        const addressChanged = this.checkIfAddressChanged(formValue);

        if (addressChanged) {
          this.adresseService.getAdresses().subscribe({
            next: (allAdresses: Adress[]) => {
              const rueSaisie = formValue.rue.trim().toLowerCase();
              const numSaisi = Number(formValue.numero);
              const codeSaisi = Number(formValue.codePostal);

              const existingAddr = allAdresses.find(a => {
                const rueDB = (a.Rue || (a as any).rue || '').toString().trim().toLowerCase();
                const numDB = Number(a.Numero || (a as any).numero);
                const codeDB = Number(a.Code || (a as any).code || (a as any).codePostal);
                return rueDB === rueSaisie && numDB === numSaisi && codeDB === codeSaisi;
              });

              if (existingAddr) {
                const idTrouve = existingAddr.id || (existingAddr as any).Id;
                this.updateUser(userBackend, formValue, idTrouve);
              } else {
                const nouvelleAdresse: Adress = {
                  Rue: formValue.rue.trim(),
                  Numero: Number(formValue.numero),
                  Code: Number(formValue.codePostal)
                };
                this.adresseService.createAdresse(nouvelleAdresse).subscribe({
                  next: (created: any) => {
                    const newId = created.id || created.Id;
                    this.updateUser(userBackend, formValue, newId);
                  },
                  error: () => {
                    this.snackBar.open('Erreur lors de la création de l\'adresse', 'Fermer', { duration: 3000 });
                    this.isLoading = false;
                  }
                });
              }
            },
            error: () => {
              this.snackBar.open('Erreur lors de la vérification de l\'adresse', 'Fermer', { duration: 3000 });
              this.isLoading = false;
            }
          });
        } else {
          this.updateUser(userBackend, formValue, userBackend.adresseId);
        }
      },
      error: () => {
        this.snackBar.open('Erreur de synchronisation', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
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

  private updateUser(oldData: any, formValue: any, adresseId: number) {
    const updateData: any = {
      id: this.data.userId,
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      adresseId: adresseId,
      roles: oldData.roles,
      motDePasse: (formValue.password && formValue.password.trim() !== '')
        ? formValue.password
        : oldData.motDePasse
    };

    this.modifierProfilService.updateProfil(this.data.userId, updateData).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur modifié avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}

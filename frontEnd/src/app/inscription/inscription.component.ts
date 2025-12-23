import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InscriptionService } from '../Service/inscription.service';
import { AdresseService } from '../Service/adresse.service';
import { CommonModule } from '@angular/common';
import { Adress } from '../Service/connection.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css'
})
export class InscriptionComponent {
  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private inscriptionService: InscriptionService,
    private adresseService: AdresseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      addressNumero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      addressRue: ['', [Validators.required, Validators.minLength(3)]],
      addressCode: ['', [Validators.required, Validators.pattern(/^\d{4,5}$/)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Veuillez remplir tous les champs correctement');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.registerForm.value;

    // 1. On récupère d'abord toutes les adresses pour comparer
    this.adresseService.getAdresses().subscribe({
      next: (allAdresses: Adress[]) => {
        const rueSaisie = formValue.addressRue.trim().toLowerCase();
        const numSaisi = Number(formValue.addressNumero);
        const codeSaisi = Number(formValue.addressCode);

        // Recherche d'une adresse identique en base
        const existingAddr = allAdresses.find(a => {
          const rueDB = (a.Rue || (a as any).rue || '').toString().trim().toLowerCase();
          const numDB = Number(a.Numero || (a as any).numero);
          const codeDB = Number(a.Code || (a as any).code || (a as any).codePostal);
          return rueDB === rueSaisie && numDB === numSaisi && codeDB === codeSaisi;
        });

        // 2. Préparation des données pour le service
        const registrationData: any = {
          firstname: formValue.firstname,
          lastname: formValue.lastname,
          email: formValue.email,
          password: formValue.password
        };

        if (existingAddr) {
          // Si trouvée, on passe l'ID. Le service ne créera pas de doublon.
          const idTrouve = existingAddr.id || (existingAddr as any).Id;
          console.log("MATCH : Adresse existante trouvée (ID: " + idTrouve + ")");
          registrationData.adresseId = idTrouve;
          registrationData.address = null; 
        } else {
          // Sinon, on passe l'objet. Le service créera l'adresse.
          console.log("NO MATCH : Une nouvelle adresse sera créée");
          registrationData.adresseId = null;
          registrationData.address = {
            rue: formValue.addressRue.trim(),
            numero: numSaisi,
            code: codeSaisi
          };
        }

        // 3. Appel au service (qui gère le switchMap en interne)
        this.executeRegistration(registrationData);
      },
      error: (err) => {
        console.error("Erreur vérification adresses:", err);
        // Si l'API adresse échoue (ex: 401), on tente quand même la création classique
        this.executeRegistration({
          firstname: formValue.firstname,
          lastname: formValue.lastname,
          email: formValue.email,
          password: formValue.password,
          adresseId: null,
          address: {
            rue: formValue.addressRue.trim(),
            numero: Number(formValue.addressNumero),
            code: Number(formValue.addressCode)
          }
        });
      }
    });
  }

  private executeRegistration(data: any): void {
    this.inscriptionService.registerFull(data).subscribe({
      next: () => {
        this.successMessage.set("Inscription réussie !");
        setTimeout(() => this.router.navigate(['/connection']), 1500);
      },
      error: (err) => {
        console.error("Erreur d'inscription finale:", err);
        this.errorMessage.set(
          err.error?.message || "Erreur de format de données (415). Vérifiez le Backend."
        );
        this.loading.set(false);
      }
    });
  }

  // Getters pour le template
  get firstname() { return this.registerForm.get('firstname'); }
  get lastname() { return this.registerForm.get('lastname'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get addressNumero() { return this.registerForm.get('addressNumero'); }
  get addressRue() { return this.registerForm.get('addressRue'); }
  get addressCode() { return this.registerForm.get('addressCode'); }
}
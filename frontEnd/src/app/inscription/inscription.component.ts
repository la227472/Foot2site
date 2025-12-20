import {Component, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {InscriptionService} from '../Service/inscription.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
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
      private router: Router
    ) {
      this.registerForm = this.fb.group({
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        // Champs pour l'adresse
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


      const userData = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        email: formValue.email,
        password: formValue.password,
        address: {
          numero: parseInt(formValue.addressNumero),
          rue: formValue.addressRue,
          code: parseInt(formValue.addressCode)
        },
        roles: "client"
      };

      console.log("DATA ENVOYÉ :", userData);

      this.inscriptionService.registerFull(userData).subscribe({
        next: () => {
          this.successMessage.set("Inscription réussie !");
          setTimeout(() => this.router.navigate(['/connection']), 1500);
        },
        error: (err) => {
          console.error("Erreur d'inscription:", err);
          this.errorMessage.set(
            err.error?.message ||
            err.error?.title ||
            "Erreur lors de l'inscription."
          );
          this.loading.set(false);
        }
      });
    }

    get firstname() { return this.registerForm.get('firstname'); }
    get lastname() { return this.registerForm.get('lastname'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get addressNumero() { return this.registerForm.get('addressNumero'); }
    get addressRue() { return this.registerForm.get('addressRue'); }
    get addressCode() { return this.registerForm.get('addressCode'); }
}

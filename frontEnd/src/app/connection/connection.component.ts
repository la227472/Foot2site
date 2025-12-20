import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router} from '@angular/router';
import { ConnectionService } from '../Service/connection.service';


@Component({
  selector: 'app-connection',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.css'
})

export class ConnectionComponent {
 loginForm: FormGroup;

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: ConnectionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/accueil']);
        },
        error: (error: { error: { message: any; }; }) => {
          this.errorMessage.set(
            error.error?.message || 'Identifiants incorrects. Veuillez réessayer.'
          );
          this.loading.set(false);
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}

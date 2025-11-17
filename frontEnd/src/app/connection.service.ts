import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../Environement/environement';

export interface LoginRequest {
  Email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

   private apiUrl = environment.apiUrl;

   constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // L'endpoint doit correspondre à votre contrôleur C#
    // Exemple: http://localhost:5184/api/auth/login
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, // Ajustez selon votre route C#
      credentials,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      tap(response => {
        // Sauvegarder le token et les infos utilisateur
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        /*localStorage.setItem('currentUser', JSON.stringify({
          username: response.username,
          userId: response.userId
        }));*/
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/connection']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

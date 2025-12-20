import {Injectable, signal} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../Environement/environement';
import { JWT } from '../Interface/JWT';
//import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private readonly KEY_TOKEN = 'authToken';
  private apiUrl = environment.apiUrl;

  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  public login(credentials:{username: string; password:string}): Observable<JWT> {
    const body = new URLSearchParams();
    body.set('email', credentials.username);
    body.set('password', credentials.password);

    // Headers pour form-urlencoded
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<JWT>(
      `${this.apiUrl}/Utilisateurs/login`,
      body.toString(),
      { headers }

    ).pipe(
      tap(response => {
        // Sauvegarder le token et les infos utilisateur
        if (response.token) {
          localStorage.setItem(this.KEY_TOKEN, response.token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.KEY_TOKEN);
    //localStorage.removeItem('currentUser');
    this.isAuthenticated.set(false);
    this.router.navigate(['/connection']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.KEY_TOKEN);
  }


  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.KEY_TOKEN);
  }

  /**
   * Décode le JWT et retourne les claims (payload)
   */
  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
/*
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }*/
  }

  /**
   * Vérifie si l'utilisateur connecté a le rôle admin
   */
  isAdmin(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return false;

    // Le backend peut stocker les rôles de différentes manières dans le JWT
    // Vérifier les deux formats possibles
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'];

    if (!roles) return false;

    // Les rôles peuvent être une string ou un tableau
    if (Array.isArray(roles)) {
      return roles.includes('admin');
    }

    return roles === 'admin';
  }

  /**
   * Récupère les informations utilisateur depuis le token
   */
  getUserInfo(): any {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    return {
      id: decoded['id'],
      nom: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded['name'],
      prenom: decoded['firstName'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded['email'],
      roles: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role']
    };
  }

}

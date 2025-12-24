import {inject, Injectable, signal} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../Environement/environement';
import { JWT } from '../Interface/JWT';
import { PanierService } from './panier.service';


// connection.service.ts

export interface Adress {
  id?: number;
  Code: number;
  Numero: number;
  Rue: string;
}

export interface CurrentUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  adresseId: number;
  commandeId: any[];
  roles: string;
  // On ajoute l'objet adresse ici (souvent renvoyé par un Include en C#)
  adresse?: Adress;
}


@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private readonly KEY_TOKEN = 'authToken';
  private readonly USER_KEY = 'current_user';
  private apiUrl = environment.apiUrl;
  private panierService = inject(PanierService);
  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<CurrentUser | null>(this.getUserFromStorage());

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
      if (response.token) {
        localStorage.setItem(this.KEY_TOKEN, response.token);
        this.isAuthenticated.set(true);

        // CORRECTION : On s'abonne pour déclencher la requête GET /api/Utilisateurs/{id}
        // On charge le user
        this.loadCurrentUser().subscribe({
          next: () => {
            // AJOUT : On force le panier à recharger les données du nouvel utilisateur
            this.panierService.loadFromStorage();
          }
        });
      }
    })
  );
  }

  /**
   * télécharge les informations au sujet du user
   */
 // connection.service.ts

/**
 * Charge les informations de l'utilisateur actuellement connecté
 */
loadCurrentUser(): Observable<CurrentUser> {
  // 1. On récupère l'ID depuis le token décodé
  const userInfo = this.getUserInfo();
  const userId = userInfo?.id;

  if (!userId) {
    return throwError(() => new Error("Impossible de trouver l'ID utilisateur dans le token"));
  }

  // 2. On appelle la route GET api/Utilisateurs/{id} conforme à votre contrôleur backend
  return this.http.get<CurrentUser>(`${this.apiUrl}/Utilisateurs/${userId}`).pipe(
    tap((user) => {
      // On sauvegarde l'objet complet pour la session
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    })
  );
}


  logout(): void {
    this.panierService.clearCart();
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/connection']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.KEY_TOKEN);
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) ?? false;
  }


  private getUserFromStorage(): CurrentUser | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }


   /*
   *Décode le JWT et retourne les claims (payload)
   */

/* * Décode le JWT manuellement sans bibliothèque externe
   */
  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Un JWT est composé de 3 parties séparées par des points : Header.Payload.Signature
      // Nous avons besoin de la partie centrale (le Payload, index 1)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur lors du décodage manuel du token:', error);
      return null;
    }
  }

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;

    if (isExpired) {
      console.warn('⚠️ Token expiré!', {
        expirationTime: new Date(decoded.exp * 1000),
        currentTime: new Date(currentTime * 1000),
        expiredSince: `${Math.floor((currentTime - decoded.exp) / 60)} minutes`
      });
    } else {
      const timeLeft = decoded.exp - currentTime;
    }

    return isExpired;
  }

  /**
   * Vérifie si l'utilisateur connecté a le rôle admin
   */
  isAdmin(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) {
      return false;
    }

    // Le backend peut stocker les rôles de différentes manières dans le JWT
    // Vérifier les deux formats possibles
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'];
    if (!roles) {
      return false;
    }

    // Les rôles peuvent être une string ou un tableau
    if (Array.isArray(roles)) {
      const hasAdmin = roles.some(role => role.toLowerCase() === 'admin');
      return hasAdmin;
    }

    const hasAdmin = roles.toLowerCase() === 'admin';
    return hasAdmin;
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

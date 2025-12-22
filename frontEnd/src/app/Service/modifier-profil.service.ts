import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';
import { Utilisateur, UpdateUtilisateurRequest } from '../Interface/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class ModifierProfilService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les informations d'un utilisateur par son ID
   */
  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/Utilisateurs/${id}`);
  }

  /**
   * Met à jour le profil d'un utilisateur
   * Correspond à l'endpoint PUT /api/Utilisateurs/{id}
   */
  updateProfil(id: number, data: UpdateUtilisateurRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Utilisateurs/${id}`, data);
  }

  /**
   * Supprime un utilisateur (optionnel, pour l'admin)
   */
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Utilisateurs/${id}`);
  }
}

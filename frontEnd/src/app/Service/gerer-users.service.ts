import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';
import { Utilisateur } from '../Interface/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class GererUsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les utilisateurs (Admin uniquement)
   */
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/Utilisateurs`);
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/Utilisateurs/${id}`);
  }

  /**
   * Supprime un utilisateur (Admin uniquement)
   */
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Utilisateurs/${id}`);
  }

  /**
   * Recherche des utilisateurs par nom, prénom ou email
   */
  searchUtilisateurs(searchTerm: string, utilisateurs: Utilisateur[]): Utilisateur[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return utilisateurs;
    }

    const term = searchTerm.toLowerCase().trim();
    return utilisateurs.filter(user =>
      user.nom?.toLowerCase().includes(term) ||
      user.prenom?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  }
}

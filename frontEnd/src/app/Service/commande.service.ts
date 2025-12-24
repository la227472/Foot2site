import { Injectable } from '@angular/core';
import { environment } from '../../Environement/environement';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Créer une commande
  createCommande(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Commandes`, payload);
  }

  // Récupérer toutes les commandes (on filtrera par utilisateur dans le composant)
  getCommandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Commandes`);
  }
}
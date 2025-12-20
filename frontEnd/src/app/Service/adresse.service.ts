import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';
import { Adress } from '../Interface/Adress';

@Injectable({
  providedIn: 'root'
})
export class AdresseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les adresses
   */
  getAdresses(): Observable<Adress[]> {
    return this.http.get<Adress[]>(`${this.apiUrl}/Adresses`);
  }

  /**
   * Récupère une adresse par son ID
   */
  getAdresse(id: number): Observable<Adress> {
    return this.http.get<Adress>(`${this.apiUrl}/Adresses/${id}`);
  }

  /**
   * Crée une nouvelle adresse
   */
  createAdresse(adresse: Adress): Observable<Adress> {
    return this.http.post<Adress>(`${this.apiUrl}/Adresses`, adresse);
  }

  /**
   * Met à jour une adresse
   */
  updateAdresse(id: number, adresse: Adress): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Adresses/${id}`, adresse);
  }

  /**
   * Supprime une adresse
   */
  deleteAdresse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Adresses/${id}`);
  }
}

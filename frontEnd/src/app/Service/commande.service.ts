import { Injectable } from '@angular/core';
import {environment} from '../../Environement/environement';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createCommande(payload: {
    utilisateurId: number;
    configurationPcId: number;
    quantite: number;
  }) {
    return this.http.post(`${this.apiUrl}/Commandes`, payload);
  }
}

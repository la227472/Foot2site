import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../Environement/environement';
import {Composants} from '../Interface/Composants';

@Injectable({
  providedIn: 'root'
})
export class ComposantsService {

  private apiUrl = environment.apiUrl;
  constructor(private http : HttpClient) {}

  getAllComposants() {
    return this.http.get<Composants[]>(`${this.apiUrl}/Composants`);
  }

  getComposantsByType(type: string) {
    return this.http.get<Composants[]>(
      `${this.apiUrl}/Composants/by-type/${type}`
    );
  }

  getComposants(id: number) {
    return this.http.get<Composants>(`${this.apiUrl}/Composants/${id}`);
  }

  addComposants(composant: Composants) {
    return this.http.post(`${this.apiUrl}/Composants`, composant);
  }
}

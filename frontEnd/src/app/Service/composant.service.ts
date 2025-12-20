import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';
import { Composant } from '../Interface/Composant';

@Injectable({
  providedIn: 'root'
})
export class ComposantService {
  private apiUrl = `${environment.apiUrl}/Composants`;

  constructor(private http: HttpClient) { }

  getAllComposants(): Observable<Composant[]> {
    return this.http.get<Composant[]>(this.apiUrl);
  }

  getComposantById(id: number): Observable<Composant> {
    return this.http.get<Composant>(`${this.apiUrl}/${id}`);
  }

  createComposant(composant: Composant): Observable<Composant> {
    return this.http.post<Composant>(this.apiUrl, composant);
  }

  updateComposant(id: number, composant: Composant): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, composant);
  }

  deleteComposant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

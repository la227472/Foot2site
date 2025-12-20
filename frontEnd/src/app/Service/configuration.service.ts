import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private apiUrl = `${environment.apiUrl}/ConfigurationPc`;

  constructor(private http: HttpClient) { }

  // Appelle l'endpoint GET qui fait l'Include(cp => cp.Composants)
  getConfigurations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
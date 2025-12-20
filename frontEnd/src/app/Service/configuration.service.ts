import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../Environement/environement';
import { Configuration, CreateConfigurationRequest, CreateConfigurationResponse } from '../Interface/Configuration';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createConfiguration(configData: CreateConfigurationRequest): Observable<CreateConfigurationResponse> {
    return this.http.post<CreateConfigurationResponse>(
      `${this.apiUrl}/ConfigurationPc`,configData,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      }
    );
  }
}

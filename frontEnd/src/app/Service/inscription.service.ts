import { Injectable } from '@angular/core';
import { environment } from '../../Environement/environement';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { Adress } from '../Interface/Adress';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  registerAddress(address: Adress) {
    return this.http.post<{ id: number }>(
      `${this.apiUrl}/Adresses`,
      address
    );
  }

  registerUser(user: any) {
    return this.http.post(`${this.apiUrl}/Utilisateurs`, user);
  }

  registerFull(data: any) {
    return this.registerAddress(data.address).pipe(
      switchMap((addr) => {
        const finalUser = {
          id: 0,
          prenom: data.firstname,
          nom: data.lastname,
          email: data.email,
          motDePasse: data.password,
          adresseId: addr.id,
          commandeId: [],
          roles: ["client"]
        };

        return this.registerUser(finalUser);
      })
    );
  }
}

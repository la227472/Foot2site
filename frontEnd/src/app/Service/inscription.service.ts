import { Injectable } from '@angular/core';
import { environment } from '../../Environement/environement';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs'; // Ajout de 'of'
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

  // La méthode accepte l'ID existant s'il y en a un
  registerFull(data: any) {
    // ÉTAPE 1 : Déterminer si on doit créer l'adresse ou si on a déjà l'ID
    const addressFlow$ = data.adresseId 
      ? of({ id: data.adresseId }) // Si on a l'ID, on crée un Observable immédiat
      : this.registerAddress(data.address); // Sinon, on appelle l'API pour créer

    // ÉTAPE 2 : Une fois qu'on a un ID (nouveau ou ancien), on crée l'user
    return addressFlow$.pipe(
      switchMap((addr) => {
        const finalUser = {
          Id: 0,
          Prenom: data.firstname, 
          Nom: data.lastname,
          Email: data.email,
          MotDePasse: data.password,
          AdresseId: addr.id,
          CommandeId: [],
          Roles: ["client"]
        };

        return this.registerUser(finalUser);
      })
    );
  }
}
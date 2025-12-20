import { Adress } from "./Adress";

export interface Utilisateur {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  motDePasse?: string;
  adresseId?: number;
  adresse?: Adress;
  roles?: string[];
  commandeId?: number[];
}

export interface UpdateUtilisateurRequest {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  motDePasse?: string;
  adresseId: number;
  adresse?: Adress;
  roles?: string[];
}

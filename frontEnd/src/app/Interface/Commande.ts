import {Configuration} from './Configuration';

export interface Commande {
  id: number;
  utilisateurId: number;
  configurationPcId: number;
  prixConfiguration: number;
  configuration?: Configuration;
}

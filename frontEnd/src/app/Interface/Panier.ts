import {Configuration} from './Configuration';
import {Commande} from './Commande';
import {Composants} from './Composants';


export interface Panier {
  configuration: Configuration;
  composants: Composants[];
  quantite: number;
}

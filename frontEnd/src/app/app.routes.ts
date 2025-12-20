import { Routes } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';
import { InscriptionComponent } from './inscription/inscription.component';
import {AccueilComponent} from './accueil/accueil.component';
import { ComparerComposComponent } from './comparer-compos/comparer-compos.component';
import { GererComposantComponent } from './gerer-composant/gerer-composant.component';
import { adminGuard } from './authen.guard';

export const routes: Routes = [
    {
        path : 'connection',
        component : ConnectionComponent,
    },

    {
        path : 'insci',
        component : InscriptionComponent,
    },

    {
      path : 'accueil',
      component : AccueilComponent,
    },

    {
      path : 'comparercompos',
      component : ComparerComposComponent,
    },

   /* {
      path : 'gerer-composant',
      component : GererComposantComponent,
      canActivate: [adminGuard]
    },
*/
    {
        path : '',
        redirectTo : 'connection',
        pathMatch : 'full',
    }
];

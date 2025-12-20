import { Routes } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';
import { InscriptionComponent } from './inscription/inscription.component';
import {AccueilComponent} from './accueil/accueil.component';
import { ModifierProfilComponent } from './modifier-profil/modifier-profil.component';

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
        path : '',
        redirectTo : 'connection',
        pathMatch : 'full',
    },
    {
        path : 'modifier-profil',
        component : ModifierProfilComponent,
    },
];

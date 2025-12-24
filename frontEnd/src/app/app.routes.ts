import { Routes } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { AccueilComponent } from './accueil/accueil.component';
import { ComparerComposComponent } from './comparer-compos/comparer-compos.component';
import { GererComposantComponent } from './gerer-composant/gerer-composant.component';
import { adminGuard } from './authen.guard';
import { CompositorComponent } from './compositor/compositor.component';
import { ProfilConfigComponent } from './profil-config/profil-config.component';
import { PanierComponent } from './panier/panier.component';
import { ModifierProfilComponent } from './modifier-profil/modifier-profil.component';
import { GererUsersComponent } from './gerer-users/gerer-users.component';
import { CommandesComponent } from './commandes/commandes.component';
import {authenGuard} from './Guard/authen.guard';

export const routes: Routes = [
  {
    path: 'connection',
    component: ConnectionComponent,
  },

  {
    path: 'compo',
    component: CompositorComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'insci',
    component: InscriptionComponent,
  },
  {
    path: 'accueil',
    component: AccueilComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'comparer',
    component: ComparerComposComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'gerer-composant',
    component: GererComposantComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'profilconfig',
    component: ProfilConfigComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'profil',
    component: ModifierProfilComponent,
    canActivate:[authenGuard],
  },
  {
    path: 'panier',
    component: PanierComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'commandes',
    component: CommandesComponent,
    canActivate:[authenGuard],
  },

  {
    path: '',
    redirectTo: 'connection',
    pathMatch: 'full',
  },

  {
    path: 'profil',
    component: ModifierProfilComponent,
    canActivate:[authenGuard],
  },

  {
    path: 'users',
    component: GererUsersComponent,
    canActivate: [adminGuard],
  }
];

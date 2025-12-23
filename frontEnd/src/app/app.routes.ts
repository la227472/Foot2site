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

export const routes: Routes = [
  {
    path: 'connection',
    component: ConnectionComponent,
  },

  {
    path: 'compo',
    component: CompositorComponent,
  },

  {
    path: 'insci',
    component: InscriptionComponent,
  },
  {
    path: 'accueil',
    component: AccueilComponent,
  },

  {
    path: 'comparer',
    component: ComparerComposComponent,
  },

  {
    path: 'gerer-composant',
    component: GererComposantComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'profilconfig',
    component: ProfilConfigComponent,
  },

  {
    path: 'profil',
    component: ModifierProfilComponent,
  },
  {
    path: 'panier',
    component: PanierComponent,
  },
  
  {
    path: '',
    redirectTo: 'connection',
    pathMatch: 'full',
  },
  
  {
    path: 'profil',
    component: ModifierProfilComponent,
  },

  {
    path: 'users',
    component: GererUsersComponent,
    canActivate: [adminGuard],
  }
];

import { Routes } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';
import { InscriptionComponent } from './inscription/inscription.component';

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
        path : '',
        redirectTo : 'connection',
        pathMatch : 'full',
    }
];

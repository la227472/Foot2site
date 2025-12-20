import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConnectionService } from './Service/connection.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const connectionService = inject(ConnectionService);
  const router = inject(Router);

  if (connectionService.isAuthenticated() && connectionService.isAdmin()) {
    return true;
  }

  router.navigate(['/accueil']);
  return false;
};

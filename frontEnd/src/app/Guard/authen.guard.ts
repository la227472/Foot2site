import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../Service/connection.service';

export const authenGuard: CanActivateFn = (route,
                                           state) => {

  const connectionService = inject(ConnectionService);
  const router = inject(Router);


  if (connectionService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/connection']);
  return false;
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ConnectionService } from './connection.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ConnectionService);
  const router = inject(Router);
  const token = authService.getToken();

  // Ne pas ajouter le token pour la requête de login
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Ajouter le token Bearer pour les autres requêtes
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si erreur 401 ET que ce n'est pas une requête de login/inscription
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/insci')) {
        // Ne déclencher l'alerte que si l'utilisateur était authentifié
        if (authService.isAuthenticated()) {
          authService.logout();
          alert('Votre session a expiré. Veuillez vous reconnecter.');
        }
      }
      return throwError(() => error);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const helperAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map(user => {
      console.log('User from API:', user);
      if (user && user.role === '3rd Party') {
        return true;
      }
      return router.createUrlTree(['/helper-signin']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/helper-signin']));
    })
  );
};

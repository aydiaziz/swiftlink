import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map(user => {
      console.log('User from API:', user);
      if (user && user.role === 'Super Admin') {
        return true;
      } else {
        return router.createUrlTree(['/unauthorized']);
      }
    }),
    catchError(() => {
      return of(router.createUrlTree(['/unauthorized']));
    })
  );
};

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as string[] | undefined) ?? [];
  const userRole = authService.getUserRole();

  if (!allowedRoles.length || (userRole && allowedRoles.includes(userRole))) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

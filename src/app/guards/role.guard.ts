import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanMatchFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Si no hay token => login
    if (!auth.estaAutenticado()) {
      router.navigate(['/login']);
      return false;
    }

    // Si no tiene rol permitido => redirigir
    const ok = auth.hasAnyRole(allowedRoles); // o allowedRoles.some(r => auth.hasRole(r))
    if (!ok) {
      router.navigate(['/catalogo']); 
      return false;
    }

    // todo OK
    return true;
  };
};
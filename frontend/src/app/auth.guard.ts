import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('authToken');
  if (token) {
    // Optionally, you can add more JWT validation here
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

// Example of a logout function within a service or component
export function logout() {
  const router = inject(Router);
  sessionStorage.removeItem('authToken');
  router.navigate(['/login']);
}

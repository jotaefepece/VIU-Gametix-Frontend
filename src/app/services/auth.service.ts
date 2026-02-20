import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = signal<boolean>(false);

  constructor(private router: Router) {
    const stored = localStorage.getItem('userLoggedIn') === 'true';
    this.loggedIn.set(stored);
  }

  // ✅ SIGNAL READONLY PARA COMPONENTES
  isAuthenticated = this.loggedIn.asReadonly();

  login() {
    localStorage.setItem('userLoggedIn', 'true');
    this.loggedIn.set(true);
    this.router.navigate(['/catalogo']);
  }

  logout() {
    localStorage.removeItem('userLoggedIn');
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }

  requireLogin(action: () => void) {
    if (!this.loggedIn()) {
      alert('Debe iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }
    action();
  }
}

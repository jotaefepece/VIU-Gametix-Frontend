import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config/api.config';

export interface RegistroDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = signal<boolean>(false);

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  constructor(private router: Router) {
    // token
    this.loggedIn.set(this.estaAutenticado());
  }

  // SIGNAL READONLY PARA COMPONENTES
  isAuthenticated = this.loggedIn.asReadonly();

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, data);
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userLoggedIn', 'true'); 
    this.loggedIn.set(true); // para que el header cambie
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userLoggedIn'); 
    this.loggedIn.set(false); // ✅
    this.router.navigate(['/login']); 
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  register(data: RegistroDTO) {
    return this.http.post<{ user: { id: number; name: string; email: string }, token: string }>(
      `${this.apiUrl}/auth/register`,
      data
    );
  }

  requireLogin(action: () => void) {
    if (!this.estaAutenticado()) { 
      alert('Debe iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }
    action();
  }
}
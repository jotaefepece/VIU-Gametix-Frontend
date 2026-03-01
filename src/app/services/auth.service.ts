import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config/api.config';
import { tap, catchError, of } from 'rxjs';

export interface RegistroDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private loggedIn = signal<boolean>(false);
  private userSig = signal<AuthUser | null>(null);

  isAuthenticated = this.loggedIn.asReadonly();
  currentUser = this.userSig.asReadonly();

  roles = computed(() => this.userSig()?.roles ?? []);

  constructor(private router: Router) {
    const hasToken = this.estaAutenticado();
    this.loggedIn.set(hasToken);

    // Si hay token, intenta traer /auth/me para tener roles al recargar
    if (hasToken) this.cargarPerfil();
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res) => {
        this.guardarToken(res.token);
        this.setUser(res.user);
      })
    );
  }

  register(data: RegistroDTO) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap((res) => {
        this.guardarToken(res.token);
        this.setUser(res.user);
      })
    );
  }

  cargarPerfil() {
    return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => this.setUser(user)),
      catchError(() => {
        // token inválido -> limpiamos
        this.logout(false);
        return of(null);
      })
    ).subscribe();
  }

  private setUser(user: AuthUser) {
    this.userSig.set(user);
    this.loggedIn.set(true);

    // persistencia simple
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userLoggedIn', 'true');
    this.loggedIn.set(true);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const current = this.roles();
    return roles.some(r => current.includes(r));
  }

  logout(navigate = true) {

    localStorage.removeItem('token');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('user');

    this.userSig.set(null);
    this.loggedIn.set(false);

    if (navigate) this.router.navigate(['/login']);
  }
}
import { Injectable, signal, inject} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config/api.config';
import { Observable } from 'rxjs';


export interface RegistroDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string
}


@Injectable({
  providedIn: 'root'
})


export class AuthService {

  private loggedIn = signal<boolean>(false);

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

 constructor(private router: Router) {
    const stored = localStorage.getItem('userLoggedIn') === 'true';
    this.loggedIn.set(stored);
  }

  // ✅ SIGNAL READONLY PARA COMPONENTES
  isAuthenticated = this.loggedIn.asReadonly();

  login(data: any) {
  return this.http.post<any>(`${this.apiUrl}/auth/login`, data);
}

guardarToken(token: string) {
  localStorage.setItem('token', token);
}

obtenerToken(): string | null {
  return localStorage.getItem('token');
}

logout() {
  localStorage.removeItem('token');
}

estaAutenticado(): boolean {
  return !!this.obtenerToken();
}

register(data: RegistroDTO) {
  return this.http.post<{ user: { id: number, name: string, email: string }, token: string }>(
    `${this.apiUrl}/auth/register`, data
  );
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

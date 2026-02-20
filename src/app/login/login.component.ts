import { Component } from '@angular/core';
import { Router } from '@angular/router';  // ← agregamos esto para redirigir después del login

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],  // si usas routerLink o forms aquí, agrega RouterLink o FormsModule
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router) {}  // inyectamos Router para redirigir

  login() {
    localStorage.setItem('userLoggedIn', 'true');
    // Redirect a catálogo o home después del "login"
    this.router.navigate(['/catalogo']);  // o '/' para home, o donde quieras
  }

}

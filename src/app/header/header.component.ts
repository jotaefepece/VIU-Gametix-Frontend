import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // 👈 AQUÍ
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private authService = inject(AuthService);
  isLoggedIn = this.authService.isAuthenticated;

  logout() {
    this.authService.logout();
  }
}

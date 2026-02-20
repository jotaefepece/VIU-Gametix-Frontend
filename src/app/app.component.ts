import { Component } from '@angular/core';
/////import { RouterOutlet } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  ///imports: [RouterOutlet, HeaderComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gametix-frontend';
}

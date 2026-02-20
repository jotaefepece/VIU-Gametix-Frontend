import { Routes } from '@angular/router';
import { PruebaComponent } from './prueba/prueba.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { ListaDeseosComponent } from './lista-deseos/lista-deseos.component';
import { CarritoComponent } from './carrito/carrito.component';
import { CategoriasComponent } from './categorias/categorias.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' },  // fuerza ir a catálogo
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'lista-deseos', component: ListaDeseosComponent, canActivate: [authGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'prueba', component: PruebaComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: '**', redirectTo: '/catalogo' }
];

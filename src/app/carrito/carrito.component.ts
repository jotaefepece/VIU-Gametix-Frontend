import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';  // ← agrega esta línea
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],  // ← agrega CommonModule aquí
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})

export class CarritoComponent {
	private carritoService = inject(CarritoService);
	items = this.carritoService.getItems();
	total = this.carritoService.total;

	actualizarCantidad(id: number, cantidad: number) {
	  this.carritoService.actualizarCantidad(id, cantidad);
	}

	eliminarProducto(id: number) {
	  this.carritoService.eliminarProducto(id);
	}
}

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})

export class CarritoComponent implements OnInit {
	private carritoService = inject(CarritoService);
  private router = inject(Router);
	//items = this.carritoService.getItems();
	//total = this.carritoService.total;

	productos: any[] = [];
  	idCarrito!: number;

	ngOnInit(): void {
    this.inicializarCarrito();
  }

  private inicializarCarrito():void{

	const idCarritoStorage = localStorage.getItem('id_carrito')

	if (!idCarritoStorage) {
      console.warn('No existe lista de deseos');
      this.productos = [];
      return;
    }

    this.idCarrito = Number(idCarritoStorage);
    this.cargarProductos();


  }

  cargarProductos(): void {

    this.carritoService.obtenerProductosCarrito(this.idCarrito)
      .subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (error) => {
          console.error('Error cargando productos:', error);
        }
      });
  }

	/*

	actualizarCantidad(id: number, cantidad: number) {
	  this.carritoService.actualizarCantidad(id, cantidad);
	}

	eliminarProducto(id: number) {
	  this.carritoService.eliminarProducto(id);
	}*/
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { WishlistService } from '../services/wishlist.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-lista-deseos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-deseos.component.html',
  styleUrls: ['./lista-deseos.component.css']
})
export class ListaDeseosComponent implements OnInit {

  private wishlistService = inject(WishlistService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  productos: any[] = [];
  idLista!: number;

  ngOnInit(): void {
    this.inicializarLista();
  }

  /**
   * Obtiene el id de la lista desde localStorage
   * y carga los productos
   */
  private inicializarLista(): void {

    const idListaStorage = localStorage.getItem('id_lista');

    if (!idListaStorage) {
      console.warn('No existe lista de deseos');
      this.productos = [];
      return;
    }

    this.idLista = Number(idListaStorage);
    this.cargarProductos();
  }

  /**
   * Consulta los productos de la lista al backend
   */
  cargarProductos(): void {

    this.wishlistService.obtenerProductos(this.idLista)
      .subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (error) => {
          console.error('Error cargando productos:', error);
        }
      });
  }

  /**
   * Elimina un producto de la lista de deseos
   */
  eliminarProductoDeLista(producto: any): void {

    
    this.wishlistService.eliminarProducto(this.idLista, producto.id).subscribe({
        next: () => {
          this.cargarProductos(); // refresca tabla
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
        }
      });
  }

  /**
   * Envía el producto al carrito
   */
 /* enviarProductoAlCarrito(producto: any): void {

    this.carritoService.agregarProducto(producto);

    console.log('Producto enviado al carrito:', producto);

    // Luego podemos eliminarlo automáticamente de la lista si quieres
  }*/

}
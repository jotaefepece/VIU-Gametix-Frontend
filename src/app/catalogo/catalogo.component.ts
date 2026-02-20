import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/producto.service';
import { WishlistService } from '../services/wishlist.service';
import { CarritoService } from '../services/carrito.service';
import { Producto } from '../models/producto.model';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit {

  private productoService = inject(ProductoService);
  private wishlistService = inject(WishlistService);
  private carritoService = inject(CarritoService);
	private authService = inject(AuthService);

  productosDestacados: Producto[] = [];
  mejoresValorados: Producto[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit() {
    console.log('CatalogoComponent cargado correctamente');
    this.cargarProductos();
  }

  private cargarProductos() {
    console.log('Intentando cargar productos...');

    this.productoService.getAll().subscribe({
      next: (productos) => {
        console.log('¡Productos recibidos de la API!', productos);

        // 🔥 ASEGURAR ID UNICO Y ESTABLE
		this.productosDestacados = productos.map(p => ({
		  ...p,
		  id_producto: p.id_producto ?? p.name   // ID FIJO
		}));


        this.mejoresValorados = this.productosDestacados.filter(
          p => p.puntuacion && p.puntuacion >= 4.7
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'No se pudieron cargar los productos. Revisa consola.';
        this.loading = false;
      }
    });
  }

  // 🔴 CONSULTA SI ESTA EN WISHLIST
  estaEnListaDeseos(id: any): boolean {
    return this.wishlistService.estaEnWishlist(id);
  }

agregarAlCarrito(producto: Producto) {
  this.authService.requireLogin(() => {
    this.carritoService.agregarProducto(producto);
  });
}

toggleListaDeseos(producto: Producto) {
  this.authService.requireLogin(() => {
    this.wishlistService.toggleProducto(producto);
  });
}
}

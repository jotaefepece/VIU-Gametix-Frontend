import { Component, inject } from '@angular/core';
import { WishlistService } from '../services/wishlist.service';
import { Producto } from '../models/producto.model';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-lista-deseos',
  standalone: true,
  imports: [],
  templateUrl: './lista-deseos.component.html',
  styleUrl: './lista-deseos.component.css'
})
export class ListaDeseosComponent {
  private wishlistService = inject(WishlistService);
  private carritoService = inject(CarritoService);

  wishlist = this.wishlistService.getWishlist();

  toggleListaDeseos(producto: Producto) {
    this.wishlistService.toggleProducto(producto);
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
  }
}

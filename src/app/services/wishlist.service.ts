import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist = signal<Producto[]>([]);

  getWishlist() {
    return this.wishlist.asReadonly();
  }
  
	toggleProducto(producto: Producto) {
	  console.log('ANTES wishlist', this.wishlist());

	  const current = this.wishlist();
	  const exists = current.some(p => p.id_producto === producto.id_producto);

	  if (exists) {
		this.wishlist.set(current.filter(p => p.id_producto !== producto.id_producto));
	  } else {
		this.wishlist.set([...current, producto]);
	  }

	  console.log('DESPUÉS wishlist', this.wishlist());
	}






  estaEnWishlist(id: number): boolean {
    return this.wishlist().some(p => p.id_producto === id);
  }

  clear() {
    this.wishlist.set([]);
  }
}

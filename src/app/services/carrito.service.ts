import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.model';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items = signal<CarritoItem[]>([]);

  getItems() {
    return this.items.asReadonly();
  }

  total = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.producto.precio ?? 0) * item.cantidad, 0);
  });

  agregarProducto(producto: Producto, cantidad: number = 1) {
    const current = this.items();
    const existingIndex = current.findIndex(i => i.producto.id_producto === producto.id_producto);

    if (existingIndex !== -1) {
      // Existe → suma cantidad
      current[existingIndex].cantidad += cantidad;
      this.items.set([...current]);
    } else {
      // No existe → agrega nuevo
      this.items.set([...current, { producto, cantidad }]);
    }
  }

  actualizarCantidad(id: number, cantidad: number) {
    if (cantidad < 1) {
      this.eliminarProducto(id);
      return;
    }

    const current = this.items();
    const index = current.findIndex(i => i.producto.id_producto === id);

    if (index !== -1) {
      current[index].cantidad = cantidad;
      this.items.set([...current]);
    }
  }

  eliminarProducto(id: number) {
    const current = this.items();
    this.items.set(current.filter(i => i.producto.id_producto !== id));
  }

  clear() {
    this.items.set([]);
  }
}

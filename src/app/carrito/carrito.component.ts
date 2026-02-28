import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  items: CarritoItem[] = [];
  idCarrito: number | null = null;

  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.initCarrito();
  }

  private initCarrito() {
    this.loading = true;
    this.errorMsg = '';

    // Key (carrito_id)
    const stored = localStorage.getItem('carrito_id');
    const id = stored ? Number(stored) : NaN;

    if (Number.isFinite(id) && id > 0) {
      this.idCarrito = id;
      this.cargarItems();
      return;
    }

    // Si no hay en storage: buscar carrito abierto o crear uno
    this.carritoService.obtenerCarritos().subscribe({
      next: (carritos) => {
        const abierto = carritos.find((c) => (c.estado || '').toLowerCase() === 'abierto');
        if (abierto) {
          this.idCarrito = abierto.id_carrito;
          localStorage.setItem('carrito_id', String(abierto.id_carrito));
          this.cargarItems();
          return;
        }

        this.carritoService.crearCarrito('abierto').subscribe({
          next: (nuevo) => {
            this.idCarrito = nuevo.id_carrito;
            localStorage.setItem('carrito_id', String(nuevo.id_carrito));
            this.cargarItems();
          },
          error: () => {
            this.loading = false;
            this.errorMsg = 'No se pudo crear el carrito.';
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.status === 401
          ? 'Tu sesión expiró. Inicia sesión de nuevo.'
          : 'No se pudo cargar el carrito.';
      },
    });
  }

  cargarItems() {
    if (!this.idCarrito) {
      this.loading = false;
      this.items = [];
      return;
    }

    this.carritoService.obtenerProductosCarrito(this.idCarrito).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error cargando productos del carrito.';
      },
    });
  }

  // UI helpers 
  get total(): number {
    return this.items.reduce((acc, it) => {
      const price = Number(it.producto?.price ?? 0);
      return acc + price * it.cantidad;
    }, 0);
  }

  // CRUD Items 
  inc(item: CarritoItem) {
    const maxStock = item.producto?.stock ?? 999;
    const nueva = Math.min(maxStock, item.cantidad + 1);
    if (nueva === item.cantidad) return;
    this.setCantidad(item, nueva);
  }

  dec(item: CarritoItem) {
    const nueva = item.cantidad - 1;
    if (nueva <= 0) {
      this.remove(item);
      return;
    }
    this.setCantidad(item, nueva);
  }

  onCantidadInput(item: CarritoItem, value: any) {
    let n = Number(value);
    if (!Number.isFinite(n) || n < 1) n = 1;

    const maxStock = item.producto?.stock ?? 999;
    if (n > maxStock) n = maxStock;

    this.setCantidad(item, n);
  }

  private setCantidad(item: CarritoItem, cantidad: number) {
    if (!this.idCarrito) return;

    // Actualiza UI primero
    const prev = item.cantidad;
    item.cantidad = cantidad;

    this.carritoService.actualizarCantidadItem(this.idCarrito, item.id_producto, cantidad).subscribe({
      next: (updated) => {
        // refrescar del backend
        item.cantidad = updated.cantidad;
      },
      error: () => {
        // rollback
        item.cantidad = prev;
        this.errorMsg = 'No se pudo actualizar la cantidad.';
      },
    });
  }

  remove(item: CarritoItem) {
    if (!this.idCarrito) return;

    const backup = [...this.items];
    this.items = this.items.filter((x) => x.id_producto !== item.id_producto);

    this.carritoService.eliminarProductoCarrito(this.idCarrito, item.id_producto).subscribe({
      next: () => {},
      error: () => {
        this.items = backup;
        this.errorMsg = 'No se pudo eliminar el producto.';
      },
    });
  }

  seguirComprando() {
    this.router.navigate(['/catalogo']);
  }
}
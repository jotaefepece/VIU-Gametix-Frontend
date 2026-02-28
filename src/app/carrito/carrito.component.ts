import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../services/carrito.service';
import { PedidoService } from '../services/pedido.service';
import { DetallePedidoService } from '../services/detalle-pedido.service';
import { MovimientoStockService } from '../services/movimiento-stock.service';
import { PagoService } from '../services/pago.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';

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
  private pedidoService = inject(PedidoService);
  private detallePedidoService = inject(DetallePedidoService);
  private movService = inject(MovimientoStockService);
  private pagoService = inject(PagoService);

  checkoutLoading = false;
  checkoutMsg = '';

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
        const abierto = carritos.find(
          (c) => (c.estado || '').toLowerCase() === 'abierto',
        );
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
        this.errorMsg =
          err?.status === 401
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

    const prev = item.cantidad;
    item.cantidad = cantidad;

    this.carritoService
      .actualizarCantidadItem(this.idCarrito, item.id_producto, cantidad)
      .subscribe({
        next: (updated) => {
          item.cantidad = updated.cantidad;
        },
        error: () => {
          item.cantidad = prev;
          this.errorMsg = 'No se pudo actualizar la cantidad.';
        },
      });
  }

  remove(item: CarritoItem) {
    if (!this.idCarrito) return;

    const backup = [...this.items];
    this.items = this.items.filter((x) => x.id_producto !== item.id_producto);

    this.carritoService
      .eliminarProductoCarrito(this.idCarrito, item.id_producto)
      .subscribe({
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

  checkout() {
    if (!this.items.length) {
      this.errorMsg = 'Tu carrito está vacío.';
      return;
    }

    this.checkoutLoading = true;
    this.checkoutMsg = '';
    this.errorMsg = '';

    const ID_ESTADO_PENDIENTE = 1; // Pendiente
    const montoTotal = this.total;

    this.pedidoService
      .crearPedido(ID_ESTADO_PENDIENTE, montoTotal)
      .pipe(
        switchMap((pedido: any) => {
          const idPedido = pedido.id_pedido;

          // 1) detalles pedido (en paralelo)
          const detalles$ = forkJoin(
            this.items.map((it) =>
              this.detallePedidoService.agregarDetalle(idPedido, {
                id_producto: it.id_producto,
                cantidad: it.cantidad,
                precio_unitario: Number(it.producto?.price ?? 0),
              }),
            ),
          );

          return detalles$.pipe(
            // 2) movimientos stock SALIDA (en paralelo)
            switchMap(() =>
              forkJoin(
                this.items.map((it) =>
                  this.movService.salida(it.id_producto, it.cantidad),
                ),
              ),
            ),

            // 3) pago simulado
            switchMap(() =>
              this.pagoService.pagar({
                id_pedido: idPedido,
                metodo_pago: 'tarjeta',
                monto: montoTotal,
                estado_pago: 'pagado',
              }),
            ),
            switchMap(() => {
              // 4) vaciar carrito en backend (DELETE por item)
              if (!this.idCarrito) return of(true);

              return forkJoin(
                this.items.map((it) =>
                  this.carritoService.eliminarProductoCarrito(
                    this.idCarrito!,
                    it.id_producto,
                  ),
                ),
              );
            }),
            // 5) limpiar carrito (UI)
            switchMap(() => {
              this.items = [];
              this.checkoutMsg = `✅ Compra completada. Pedido #${idPedido}`;
              return of({ ok: true, idPedido });
            }),
          );
        }),
        catchError((err) => {
          this.checkoutLoading = false;

          this.checkoutMsg = '';
          this.errorMsg =
            err?.status === 401
              ? 'Sesión expirada. Inicia sesión.'
              : err?.status === 422
                ? 'No se pudo completar (stock/validación).'
                : 'Falló el checkout. Intenta nuevamente.';
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.checkoutLoading = false;

        // Navegar a pedidos:
        // if (res?.ok) this.router.navigate(['/pedidos']);
      });
  }
}

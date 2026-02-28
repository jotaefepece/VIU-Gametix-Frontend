import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../services/producto.service';
import { CarritoService, Carrito } from '../services/carrito.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  imports: [CommonModule, RouterModule],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private carritoService = inject(CarritoService);

  private destroy$ = new Subject<void>();

  loading = true;
  errorMsg = '';
  product?: Product;

  // UI cantidad
  qty = 1;
  addingToCart = false;
  addedMsg = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!id) {
        this.loading = false;
        this.errorMsg = 'ID inválido';
        return;
      }

      this.fetchProduct(id);
    });
  }

  private fetchProduct(id: number) {
    this.loading = true;
    this.errorMsg = '';
    this.product = undefined;

    this.productService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.product = p;
          this.loading = false;
          this.qty = 1;
          this.addedMsg = '';
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg =
            err?.status === 404
              ? 'Producto no encontrado o no disponible.'
              : 'Ocurrió un error cargando el producto.';
        },
      });
  }

  // Cantidad
  decQty() {
    this.qty = Math.max(1, (this.qty || 1) - 1);
  }

  incQty() {
    const max = this.product?.stock && this.product.stock > 0 ? this.product.stock : 999;
    this.qty = Math.min(max, (this.qty || 1) + 1);
  }

  onQtyChange(value: any) {
    let n = Number(value);
    if (!Number.isFinite(n) || n < 1) n = 1;

    const max = this.product?.stock && this.product.stock > 0 ? this.product.stock : 999;
    if (n > max) n = max;

    this.qty = n;
  }

  // Carrito: obtener o crear
  private getCarritoIdFromStorage(): number | null {
    const raw = localStorage.getItem('carrito_id');
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private setCarritoIdToStorage(id: number) {
    localStorage.setItem('carrito_id', String(id));
  }

  private obtenerOCrearCarritoAbierto(): Promise<Carrito> {
    return new Promise((resolve, reject) => {
      // Si ya hay carrito_id guardado, lo usamos 
      const cachedId = this.getCarritoIdFromStorage();
      if (cachedId) {
        return resolve({ id_carrito: cachedId, estado: 'abierto' } as Carrito);
      }

      // Si no hay, pedimos lista y buscamos abierto
      this.carritoService.obtenerCarritos().pipe(takeUntil(this.destroy$)).subscribe({
        next: (carritos) => {
          const abierto = carritos.find(
            (c) => (c.estado || '').toLowerCase() === 'abierto'
          );

          if (abierto) {
            this.setCarritoIdToStorage(abierto.id_carrito);
            return resolve(abierto);
          }

          // Si no existe, lo creamos
          this.carritoService.crearCarrito('abierto').pipe(takeUntil(this.destroy$)).subscribe({
            next: (nuevo) => {
              this.setCarritoIdToStorage(nuevo.id_carrito);
              resolve(nuevo);
            },
            error: (e) => reject(e),
          });
        },
        error: (e) => reject(e),
      });
    });
  }

  // Agregar al carrito
  async addToCart() {
    if (!this.product) return;

    if (this.product.stock <= 0) {
      this.addedMsg = 'Sin stock disponible.';
      return;
    }

    this.addingToCart = true;
    this.addedMsg = '';

    try {
      const carrito = await this.obtenerOCrearCarritoAbierto();

      this.carritoService
        .agregarProductoCarrito(carrito.id_carrito, this.product.id, this.qty)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.addingToCart = false;
            this.addedMsg = `Agregado al carrito (x${this.qty}).`;
          },
          error: (err) => {
            this.addingToCart = false;
            this.addedMsg =
              err?.status === 401
                ? 'Tu sesión expiró. Inicia sesión de nuevo.'
                : err?.status === 422
                ? 'No se pudo agregar (datos inválidos).'
                : 'No se pudo agregar al carrito.';
          },
        });
    } catch {
      this.addingToCart = false;
      this.addedMsg = 'No se pudo obtener o crear el carrito.';
    }
  }

  // Navegación
  goBack() {
    this.router.navigate(['/catalogo']);
  }

  openWebsite(url?: string | null) {
    if (!url) return;
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
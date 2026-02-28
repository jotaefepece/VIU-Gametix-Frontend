import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product, ProductService } from '../services/producto.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  private destroy$ = new Subject<void>();

  loading = true;
  errorMsg = '';
  product?: Product;

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
        },
        error: (err) => {
          this.loading = false;

          // Si backend devuelve 404 por inactivo/no existe
          if (err?.status === 404) {
            this.errorMsg = 'Producto no encontrado o no disponible.';
            return;
          }

          this.errorMsg = 'Ocurrió un error cargando el producto.';
        },
      });
  }

  goBack() {
    // vuelve a catalogo (ajusta si tu ruta se llama distinto)
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
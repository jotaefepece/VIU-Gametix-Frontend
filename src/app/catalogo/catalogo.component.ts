import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  ProductService,
  Product,
  CategoryMini,
  CompanyMini,
  PaginatedResponse,
  ProductsFilters,
} from '../services/producto.service';

import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatSnackBarModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent implements OnInit {
  loading = false;
  error: string | null = null;

  // data
  items: Product[] = [];

  // combos
  categories: CategoryMini[] = [];
  companies: CompanyMini[] = [];

  // filtros UI
  q = '';
  category_id: number | null = null;
  id_compania: number | null = null;
  min_price: number | null = null;
  max_price: number | null = null;
  in_stock: boolean | null = null;

  // paginación
  page = 1;
  limit = 12;

  meta = {
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1,
  };

  constructor(
    private productService: ProductService,
    private router: Router,
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCombos();
    this.fetch();
  }

  private toastOk(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 2500 });
  }

  private toastError(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
  }

  private loadCombos() {
    this.productService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res?.data ?? []);
      },
    });

    this.productService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = Array.isArray(res) ? res : (res?.data ?? []);
      },
    });
  }

  private buildFilters(): ProductsFilters {
    const f: ProductsFilters = {
      q: this.q?.trim() || undefined,
      category_id: this.category_id ?? undefined,
      id_compania: this.id_compania ?? undefined,
      min_price: this.min_price ?? undefined,
      max_price: this.max_price ?? undefined,
      in_stock: this.in_stock ?? undefined,
      page: this.page,
      limit: this.limit,
    };

    // Limpieza de filtros: eliminar claves con valores vacíos o nulos
    Object.keys(f).forEach((k) => {
      const key = k as keyof ProductsFilters;
      if (f[key] === undefined || f[key] === null || f[key] === '') {
        delete f[key];
      }
    });

    return f;
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    const filters = this.buildFilters();

    this.productService.getProductsAdmin(filters).subscribe({
      next: (resp: PaginatedResponse<Product>) => {
        this.items = resp.data ?? [];
        this.meta = {
          current_page: resp.current_page,
          per_page: resp.per_page,
          total: resp.total,
          last_page: resp.last_page,
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar productos';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetch();
  }

  clearFilters(): void {
    this.q = '';
    this.category_id = null;
    this.id_compania = null;
    this.min_price = null;
    this.max_price = null;
    this.in_stock = null;
    this.page = 1;
    this.fetch();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.meta.last_page) return;
    this.page = p;
    this.fetch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prev(): void {
    this.goToPage(this.meta.current_page - 1);
  }

  next(): void {
    this.goToPage(this.meta.current_page + 1);
  }

  get pages(): number[] {
    // paginación 
    const last = this.meta.last_page || 1;
    const cur = this.meta.current_page || 1;
    const windowSize = 2; 

    const start = Math.max(1, cur - windowSize);
    const end = Math.min(last, cur + windowSize);

    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  irDetalle(id: number) {
    this.router.navigate(['/producto', id]);
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  agregarALista(producto: Product) {
  if (!this.estaLogueado()) {
    this.router.navigate(['/login']);
    return;
  }

  const idListaStorage = localStorage.getItem('id_lista');
  const idLista = idListaStorage ? parseInt(idListaStorage, 10) : null;

  if (!idLista) {
    const dataLista = {
      nombre: 'Deseos 2026',
      descripcion: 'Jueguitos y accesorios que quiero comprar',
    };

    this.wishlistService.crearLista(dataLista).subscribe({
      next: (lista) => {
        localStorage.setItem('id_lista', String(lista.id_lista));
        this.agregarProductoALista(lista.id_lista, producto);
      },
      error: (err) => {
        console.error('Error creando lista', err);
      },
    });

    return;
  }

  this.agregarProductoALista(idLista, producto);
}

private agregarProductoALista(idLista: number, producto: Product) {
  this.wishlistService.agregarProducto(idLista, producto.id).subscribe({
    next: (resp) => {
      console.log('Producto agregado a deseos ✅', resp);
      this.toastOk('Agregado a deseos 🤍');
    },
    error: (err) => {
     if (err?.status === 409) {
        this.toastOk('Ese producto ya está en tus deseos.');
        return;
      }
      if (err?.status === 401) {
        this.toastError('Debes iniciar sesión para agregar a deseos');
        this.router.navigate(['/login']);
        return;
      }
      this.toastError('No se pudo agregar. Por favor, intenta de nuevo.');
      console.error('Error agregando producto', err);
    },
  });
}
}
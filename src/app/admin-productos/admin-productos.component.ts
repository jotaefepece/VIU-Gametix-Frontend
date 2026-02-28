import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProductService,
  Product,
  CategoryMini,
  CompanyMini,
  PaginatedResponse,
} from '../services/producto.service';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css'],
})
export class AdminProductosComponent implements OnInit {
  // Data Listado
  productos: Product[] = [];
  loading = true;
  error: string | null = null;

  // Paginación
  page = 1;
  limit = 10;
  total = 0;
  lastPage = 1;

  // Filtros
  filtros = {
    q: '',
    category_id: null as number | null,
    id_compania: null as number | null,
    min_price: null as number | null,
    max_price: null as number | null,
    in_stock: null as boolean | null, // null = no filtra
  };

  // Combos
  categorias: CategoryMini[] = [];
  companias: CompanyMini[] = [];

  // Modal
  modalOpen = false;
  modalMode: ModalMode = 'create';
  editingId: number | null = null;

  // Form reusable (create/edit)
  form: {
    name: string;
    description: string | null;
    price: number;
    website: string | null;
    stock: number;
    category_id: number | null;
    id_compania: number | null;
    image_url: string | null;
  } = this.getEmptyForm();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Cargar combos y listado inicial
    this.cargarCombos();
    this.cargarProductos();
  }


  // LISTADO + FILTROS

  cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productService
      .getProductsAdmin({
        ...this.filtros,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (res: PaginatedResponse<Product>) => {
          this.productos = res.data ?? [];
          this.total = res.total ?? 0;
          this.lastPage = res.last_page ?? 1;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos';
          this.loading = false;
        },
      });
  }

  aplicarFiltros(): void {
    this.page = 1; // al filtrar, volvemos a la primera página
    this.cargarProductos();
  }

  limpiarFiltros(): void {
    this.filtros = {
      q: '',
      category_id: null,
      id_compania: null,
      min_price: null,
      max_price: null,
      in_stock: null,
    };
    this.page = 1;
    this.cargarProductos();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page--;
    this.cargarProductos();
  }

  nextPage(): void {
    if (this.page >= this.lastPage) return;
    this.page++;
    this.cargarProductos();
  }


  // COMBOS

  cargarCombos(): void {
    // Categorías
    this.productService.getCategories().subscribe({
      next: (res: any) => {
        // Array o paginado (data)
        this.categorias = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => {
        this.categorias = [];
      },
    });

    // Compañías (/companias)
    this.productService.getCompanies().subscribe({
      next: (res: any) => {
        this.companias = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => {
        this.companias = [];
      },
    });
  }


  // MODAL (Create/Edit reutilizar)

  abrirNuevo(): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.form = this.getEmptyForm();
    this.modalOpen = true;
  }

  abrirEditar(p: Product): void {
    this.modalMode = 'edit';
    this.editingId = p.id;

    const categoryId = (p as any).category_id ?? p.category?.id ?? null;
    const companiaId = (p as any).id_compania ?? p.company?.id_compania ?? null;

    this.form = {
      name: p.name ?? '',
      description: p.description ?? null,
      price: Number(p.price ?? 0),
      website: p.website ?? null,
      stock: Number(p.stock ?? 0),
      category_id: categoryId,
      id_compania: companiaId,
      image_url: (p as any).image_url ?? null,
    };

    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
  }

  guardar(): void {
    // Validaciones mínimas
    if (!this.form.name?.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!this.form.category_id) {
      alert('Selecciona una categoría.');
      return;
    }
    if (!this.form.id_compania) {
      alert('Selecciona una compañía.');
      return;
    }

    // Payload para backend 
    const payload = {
      name: this.form.name.trim(),
      description: this.form.description,
      price: Number(this.form.price ?? 0),
      website: this.form.website,
      stock: Number(this.form.stock ?? 0),
      category_id: this.form.category_id,
      id_compania: this.form.id_compania,
      image_url: this.form.image_url,
    };

    if (this.modalMode === 'create') {
      this.productService.createProduct(payload as any).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (err) => {
          alert('Error creando producto');
        },
      });
      return;
    }

    // Edit
    if (!this.editingId) return;

    this.productService.updateProduct(this.editingId, payload as any).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarProductos();
      },
      error: (err) => {
        alert('Error actualizando producto');
      },
    });
  }

  // DELETE (soft en backend)

  eliminar(p: Product): void {
    const ok = confirm(`¿Desactivar el producto "${p.name}"?`);
    if (!ok) return;

    this.productService.deleteProduct(p.id).subscribe({
      next: () => {
        // si se borró el último de la página, opcionalmente retrocede
        if (this.productos.length === 1 && this.page > 1) this.page--;
        this.cargarProductos();
      },
      error: () => alert('Error desactivando producto'),
    });
  }


  // HELPERS

  private getEmptyForm() {
    return {
      name: '',
      description: null,
      price: 0,
      website: null,
      stock: 0,
      category_id: null,
      id_compania: null,
      image_url: null,
    };
  }

  // para la tabla (imagen)
  getImageSrc(p: Product): string {
    const url = (p as any).imagen_url as string | null | undefined;
    return url?.trim()
      ? url
      : 'https://via.placeholder.com/60x60?text=Img';
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category, PaginatedResponse } from '../services/category.service';

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categorias.component.html',
  styleUrls: ['./admin-categorias.component.css'],
})
export class AdminCategoriasComponent implements OnInit {
  categorias: Category[] = [];
  loading = true;
  error: string | null = null;

  page = 1;
  limit = 10;
  total = 0;
  lastPage = 1;

  filtros = {
    q: '',
  };

  modalOpen = false;
  modalMode: ModalMode = 'create';
  editingId: number | null = null;

  form: { descripcion: string } = { descripcion: '' };

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.error = null;

    this.categoryService
      .getCategoriesAdmin({ q: this.filtros.q, page: this.page, limit: this.limit })
      .subscribe({
        next: (res: PaginatedResponse<Category>) => {
          this.categorias = res.data ?? [];
          this.total = res.total ?? 0;
          this.lastPage = res.last_page ?? 1;
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al cargar categorías';
          this.loading = false;
        },
      });
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.cargarCategorias();
  }

  limpiarFiltros(): void {
    this.filtros.q = '';
    this.page = 1;
    this.cargarCategorias();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page--;
    this.cargarCategorias();
  }

  nextPage(): void {
    if (this.page >= this.lastPage) return;
    this.page++;
    this.cargarCategorias();
  }

  abrirNuevo(): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.form = { descripcion: '' };
    this.modalOpen = true;
  }

  abrirEditar(c: Category): void {
    this.modalMode = 'edit';
    this.editingId = c.id;
    this.form = { descripcion: c.descripcion ?? '' };
    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
  }

  guardar(): void {
    const descripcion = this.form.descripcion?.trim();
    if (!descripcion) {
      alert('La descripción es obligatoria.');
      return;
    }

    if (this.modalMode === 'create') {
      this.categoryService.createCategory({ descripcion }).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: () => alert('Error creando categoría'),
      });
      return;
    }

    if (!this.editingId) return;

    this.categoryService.updateCategory(this.editingId, { descripcion }).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCategorias();
      },
      error: () => alert('Error actualizando categoría'),
    });
  }

  eliminar(c: Category): void {
    const ok = confirm(`¿Desactivar la categoría "${c.descripcion}"?`);
    if (!ok) return;

    this.categoryService.deleteCategory(c.id).subscribe({
      next: () => {
        if (this.categorias.length === 1 && this.page > 1) this.page--;
        this.cargarCategorias();
      },
      error: () => alert('Error desactivando categoría'),
    });
  }
}
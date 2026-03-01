import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PagoService, EstadoPago } from '../services/pago.service'; // ajusta ruta

type PagoRow = {
  id_pago: number;
  id_pedido: number;
  metodo_pago: string;
  estado_pago: EstadoPago | string;
  monto: number;
  fecha_pago?: string;
  pedido?: any;
};

type LaravelPagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagoService = inject(PagoService);

  loading = false;
  errorMsg = '';

  items: PagoRow[] = [];

  // paginación
  page = 1;
  limit = 10;
  lastPage = 1;
  total = 0;

  // filtros
  form = this.fb.group({
    q: [''],
    id_pedido: [''],
    estado: [''],
    metodo: [''],
    desde: [''],
    hasta: [''],
    min: [''],
    max: [''],
  });

  ngOnInit(): void {
    this.buscar(true);
  }

  buscar(resetPage = false) {
    if (resetPage) this.page = 1;

    this.loading = true;
    this.errorMsg = '';

    const v = this.form.value;

    const filters: any = {
      q: v.q?.trim() || undefined,
      id_pedido: v.id_pedido ? Number(v.id_pedido) : undefined,
      estado: v.estado || undefined,
      metodo: v.metodo?.trim() || undefined,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
      min: v.min !== '' && v.min != null ? Number(v.min) : undefined,
      max: v.max !== '' && v.max != null ? Number(v.max) : undefined,

      // Paginado
      page: this.page,
      limit: this.limit,
    };

    this.pagoService
      .listar(filters)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: LaravelPagination<PagoRow> | PagoRow[]) => {
          // Caso sin paginación
          if (Array.isArray(res)) {
            this.items = res;
            this.total = res.length;
            this.lastPage = 1;
            return;
          }

          this.items = res.data ?? [];
          this.page = res.current_page ?? 1;
          this.lastPage = res.last_page ?? 1;
          this.total = res.total ?? 0;
          this.limit = res.per_page ?? this.limit;
        },
        error: (err) => {
          this.errorMsg =
            err?.error?.message || 'No se pudieron cargar los pagos.';
          this.items = [];
        },
      });
  }

  limpiar() {
    this.form.reset({
      q: '',
      id_pedido: '',
      estado: '',
      metodo: '',
      desde: '',
      hasta: '',
      min: '',
      max: '',
    });
    this.page = 1;
    this.buscar(true);
  }

  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.buscar(false);
  }

  nextPage() {
    if (this.page >= this.lastPage) return;
    this.page++;
    this.buscar(false);
  }

  setLimit(val: string) {
    this.limit = Number(val) || 10;
    this.page = 1;
    this.buscar(true);
  }

  // Helpers
  money(n: any): string {
    const num = Number(n ?? 0);
    return num.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }

  formatDate(fecha?: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    return d.toLocaleDateString('es-CL');
  }
}
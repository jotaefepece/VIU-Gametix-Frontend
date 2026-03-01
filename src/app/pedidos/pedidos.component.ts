import { Component, inject } from '@angular/core';
import { PedidoService } from '../services/pedido.service';
import { FormsModule } from '@angular/forms';

type Pedido = {
  id_pedido: number;
  id_estado: number;
  monto_total: number;
  fecha?: string;
  estado?: { id_estado: number; descripcion: string };
};

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
})
export class PedidosComponent {
  private pedidoService = inject(PedidoService);

  loading = false;
  errorMsg = '';

  items: Pedido[] = [];

  // filtros
  q = '';
  id_estado: number | null = null;
  desde = '';
  hasta = '';
  min: number | null = null;
  max: number | null = null;

  // paginación (opcional)
  limit: number | null = 10;
  page = 1;
  lastPage = 1;
  total = 0;

  ngOnInit(): void {
    this.buscar(true);
  }

  buscar(resetPage: boolean) {
    if (resetPage) this.page = 1;

    this.loading = true;
    this.errorMsg = '';

    this.pedidoService
      .listar({
        q: this.q || undefined,
        id_estado: this.id_estado ?? undefined,
        desde: this.desde || undefined,
        hasta: this.hasta || undefined,
        min: this.min ?? undefined,
        max: this.max ?? undefined,
        page: this.page,
        limit: this.limit ?? undefined,
      })
      .subscribe({
        next: (res) => {
          // Si viene paginado
          if (res?.data && Array.isArray(res.data)) {
            this.items = res.data;
            this.lastPage = res.last_page ?? 1;
            this.total = res.total ?? this.items.length;
            this.page = res.current_page ?? this.page;
            return;
          }

          // Si viene sin paginar
          if (Array.isArray(res)) {
            this.items = res;
            this.lastPage = 1;
            this.total = res.length;
            return;
          }

          // fallback
          this.items = [];
          this.lastPage = 1;
          this.total = 0;
        },
        error: (err) => {
          this.errorMsg =
            err?.error?.message ||
            'No se pudieron cargar los pedidos. Revisa autenticación/token.';
        },
        complete: () => (this.loading = false),
      });
  }

  limpiar() {
    this.q = '';
    this.id_estado = null;
    this.desde = '';
    this.hasta = '';
    this.min = null;
    this.max = null;
    this.buscar(true);
  }

  irPagina(p: number) {
    if (p < 1 || p > this.lastPage) return;
    this.page = p;
    this.buscar(false);
  }

  eliminarPedido(pedido: Pedido) {
    const ok = confirm(`¿Eliminar pedido #${pedido.id_pedido}?`);
    if (!ok) return;

    this.pedidoService.eliminar(pedido.id_pedido).subscribe({
      next: () => {
        // refrescar
        this.buscar(false);
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar el pedido.');
      },
    });
  }

  moneyCLP(n: number | string | null | undefined): string {
    const v = Number(n ?? 0);
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }

  formatDateTime(s?: string | null): string {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s);

    const pad = (x: number) => String(x).padStart(2, '0');

    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
}

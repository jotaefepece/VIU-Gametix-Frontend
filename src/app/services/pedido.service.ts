import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

export type PedidoFilters = {
  q?: string;
  id_estado?: number | null;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  min?: number | null;
  max?: number | null;
  page?: number;
  limit?: number | null; // si es null/undefined => sin paginar
};

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/pedidos`;

  // Crear pedido
  crearPedido(id_estado: number, monto_total: number): Observable<any> {
    return this.http.post(this.endpoint, { id_estado, monto_total });
  }

  // Listar con filtros y paginado (opcional)
  listar(filters: PedidoFilters = {}): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get(this.endpoint, { params });
  }

  // Eliminar (soft delete)
  eliminar(id_pedido: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id_pedido}`);
  }

  //Actualizar estado pedido
   actualizarEstadoPedido(id_pedido: number, id_estado: number) {
  return this.http.patch(`${this.endpoint}/${id_pedido}`, { id_estado });
}
}
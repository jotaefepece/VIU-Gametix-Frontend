import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

export type EstadoPago = 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado';

export interface PagoFilters {
  q?: string;
  id_pedido?: number;
  estado?: EstadoPago;     
  metodo?: string;
  desde?: string;          // 'YYYY-MM-DD'
  hasta?: string;          // 'YYYY-MM-DD'
  min?: number;
  max?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/pagos`;

  pagar(payload: {
    id_pedido: number;
    metodo_pago: string;
    monto: number;
    estado_pago: EstadoPago;
  }): Observable<any> {
    return this.http.post(this.endpoint, payload);
  }

  listar(filters: PagoFilters = {}): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      params = params.set(key, String(value));
    });

    return this.http.get(this.endpoint, { params });
  }

  obtenerPorId(id_pago: number): Observable<any> {
    return this.http.get(`${this.endpoint}/${id_pago}`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class DetallePedidoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  agregarDetalle(
    id_pedido: number,
    payload: { id_producto: number; cantidad: number; precio_unitario: number }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/${id_pedido}/detalles`, payload);
  }
}
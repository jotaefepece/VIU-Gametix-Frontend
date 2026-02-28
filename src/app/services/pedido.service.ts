import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/pedidos`;

  crearPedido(id_estado: number, monto_total: number): Observable<any> {
    return this.http.post(this.endpoint, { id_estado, monto_total });
  }
}
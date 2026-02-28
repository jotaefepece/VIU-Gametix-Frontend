import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class MovimientoStockService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/movimiento-stock`;

  salida(id_producto: number, cantidad: number): Observable<any> {
    return this.http.post(this.endpoint, {
      id_producto,
      tipo_movimiento: 'SALIDA',
      cantidad,
    });
  }
}
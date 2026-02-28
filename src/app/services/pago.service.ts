import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/pagos`;

  pagar(payload: {
    id_pedido: number;
    metodo_pago: string;
    monto: number;
    estado_pago: 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado';
  }): Observable<any> {
    return this.http.post(this.endpoint, payload);
  }
}
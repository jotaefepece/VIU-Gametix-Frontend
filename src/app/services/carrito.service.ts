import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config'; 


@Injectable({
  providedIn: 'root'
})
export class CarritoService {

    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);
    private endpoint = `${this.apiUrl}/carritos`;

  crearCarrito(userId: number, estado: string ): Observable<any>{
    return this.http.post(this.endpoint, { user_id: userId, estado: estado });
  }

   agregarProductoCarrito(idCarrito: number, idProducto: number): Observable<any> {
    return this.http.post(
      `${this.endpoint}/${idCarrito}/items`,
      { id_producto: idProducto }
    );
  }

  obtenerProductosCarrito(idCarrito: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.endpoint}/${idCarrito}/items`
    );
  }

  eliminarProductoCarrito(idCarrito: number, idProducto: number): Observable<any> {
    return this.http.delete(
      `${this.endpoint}/${idCarrito}/items/${idProducto}`
    );
  }



}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';
import { Product } from './producto.service';

export interface Carrito {
  id_carrito: number;
  id_usuario?: number; 
  estado: string;
  created_at?: string;
  updated_at?: string;
}

export interface CarritoItem {
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  producto?: Product; 
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/carritos`;

  // GET /carritos (carritos del usuario autenticado)
  obtenerCarritos(): Observable<Carrito[]> {
    return this.http.get<Carrito[]>(this.endpoint);
  }

  // POST /carritos (usuario sale del token)
  crearCarrito(estado: string = 'abierto'): Observable<Carrito> {
    return this.http.post<Carrito>(this.endpoint, { estado });
  }

  // GET /carritos/{id}
  obtenerCarrito(idCarrito: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.endpoint}/${idCarrito}`);
  }

  // GET /carritos/{idCarrito}/items
  obtenerProductosCarrito(idCarrito: number): Observable<CarritoItem[]> {
    return this.http.get<CarritoItem[]>(`${this.endpoint}/${idCarrito}/items`);
  }

  // POST /carritos/{idCarrito}/items  (cantidad requerida por tu backend)
  agregarProductoCarrito(
    idCarrito: number,
    idProducto: number,
    cantidad: number = 1
  ): Observable<CarritoItem> {
    return this.http.post<CarritoItem>(`${this.endpoint}/${idCarrito}/items`, {
      id_producto: idProducto,
      cantidad,
    });
  }

  // PATCH /carritos/{idCarrito}/items/{idProducto}  (set cantidad)
  actualizarCantidadItem(
    idCarrito: number,
    idProducto: number,
    cantidad: number
  ): Observable<CarritoItem> {
    return this.http.patch<CarritoItem>(
      `${this.endpoint}/${idCarrito}/items/${idProducto}`,
      { cantidad }
    );
  }

  // PUT /carritos/{idCarrito}/items/{idProducto} (si quieres usar PUT también)
  actualizarCantidadItemPut(
    idCarrito: number,
    idProducto: number,
    cantidad: number
  ): Observable<CarritoItem> {
    return this.http.put<CarritoItem>(
      `${this.endpoint}/${idCarrito}/items/${idProducto}`,
      { cantidad }
    );
  }

  //DELETE /carritos/{idCarrito}/items/{idProducto}
  eliminarProductoCarrito(idCarrito: number, idProducto: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.endpoint}/${idCarrito}/items/${idProducto}`
    );
  }
}
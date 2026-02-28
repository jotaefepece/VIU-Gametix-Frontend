import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config'; 

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private endpoint = `${this.apiUrl}/lista-deseos`;

  /**
   * Crear lista de deseos
   */
  crearLista(data: {
    id_usuario: number;
    nombre: string;
    descripcion: string;
  }): Observable<any> {
    return this.http.post(this.endpoint, data);
  }

  /**
   * Agregar producto a la lista
   */
  agregarProducto(idLista: number, idProducto: number): Observable<any> {
    return this.http.post(
      `${this.endpoint}/${idLista}/productos`,
      { id_producto: idProducto }
    );
  }

  /**
   * Obtener productos de la lista
   */
  obtenerProductos(idLista: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.endpoint}/${idLista}/productos`
    );
  }

  /**
   * Eliminar producto de la lista
   */
  eliminarProducto(idLista: number, idProducto: number): Observable<any> {
    return this.http.delete(
      `${this.endpoint}/${idLista}/productos/${idProducto}`
    );
  }

}
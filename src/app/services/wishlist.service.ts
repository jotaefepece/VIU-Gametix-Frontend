import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

export type ListaDeseo = {
  id_lista: number;
  id_usuario: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean | number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  next_page_url: string | null;
  prev_page_url: string | null;
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private endpoint = `${this.apiUrl}/lista-deseos`;

  listar(params?: { q?: string; page?: number; limit?: number; })
    : Observable<ListaDeseo[] | PaginatedResponse<ListaDeseo>> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.limit != null) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<ListaDeseo[] | PaginatedResponse<ListaDeseo>>(this.endpoint, { params: httpParams });
  }

  crearLista(data: { nombre: string; descripcion?: string | null }): Observable<ListaDeseo> {
    return this.http.post<ListaDeseo>(this.endpoint, data);
  }

  obtenerLista(idLista: number): Observable<ListaDeseo> {
    return this.http.get<ListaDeseo>(`${this.endpoint}/${idLista}`);
  }

  actualizarLista(
    idLista: number,
    data: { nombre?: string; descripcion?: string | null }
  ): Observable<ListaDeseo> {
    return this.http.patch<ListaDeseo>(`${this.endpoint}/${idLista}`, data);
  }

  eliminarLista(idLista: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.endpoint}/${idLista}`);
  }

  agregarProducto(idLista: number, idProducto: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.endpoint}/${idLista}/productos`,
      { id_producto: idProducto }
    );
  }

  obtenerProductos<T = any>(idLista: number): Observable<T[]> {
    return this.http.get<T[]>(`${this.endpoint}/${idLista}/productos`);
  }

  eliminarProducto(idLista: number, idProducto: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.endpoint}/${idLista}/productos/${idProducto}`
    );
  }
}
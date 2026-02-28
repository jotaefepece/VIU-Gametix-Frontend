import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config/api.config';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  descripcion: string;
  activo: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CategoriesFilters {
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  /** Admin: Paginado */
  getCategoriesAdmin(filters: CategoriesFilters = {}): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams();

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    params = params.set('page', page);
    params = params.set('limit', limit);

    if (filters.q?.trim()) params = params.set('q', filters.q.trim());

    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`, { params });
  }

  createCategory(payload: { descripcion: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, payload);
  }

  updateCategory(id: number, payload: { descripcion?: string; activo?: boolean }): Observable<any> {

    return this.http.put(`${this.apiUrl}/categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }
}
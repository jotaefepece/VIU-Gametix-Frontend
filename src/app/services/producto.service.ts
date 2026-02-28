import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config/api.config';
import { Observable } from 'rxjs';

/** MODELOS **/
export interface CategoryMini {
  id: number;
  descripcion: string;
  activo?: boolean;
}

export interface CompanyMini {
  id_compania: number;
  nombre: string;
  descripcion?: string | null;
  sitio_web?: string | null;
  activo?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imagen_url?: string | null;
  website?: string | null;
  stock: number;

  category?: CategoryMini;
  company?: CompanyMini;

  category_id?: number;
  id_compania?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProductsFilters {
  q?: string;
  category_id?: number | null;
  id_compania?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  in_stock?: boolean | null;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  /** CATÁLOGO*/
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  /** DETALLE */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  /** CATÁLOGO ADMIN: filtros y paginado **/
  getProductsAdmin(
    filters: ProductsFilters = {},
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    params = params.set('page', page);
    params = params.set('limit', limit);

    if (filters.q?.trim()) params = params.set('q', filters.q.trim());
    if (filters.category_id)
      params = params.set('category_id', filters.category_id);
    if (filters.id_compania)
      params = params.set('id_compania', filters.id_compania);

    if (filters.min_price !== null && filters.min_price !== undefined) {
      params = params.set('min_price', filters.min_price);
    }
    if (filters.max_price !== null && filters.max_price !== undefined) {
      params = params.set('max_price', filters.max_price);
    }

    if (filters.in_stock !== null && filters.in_stock !== undefined) {
      params = params.set('in_stock', String(filters.in_stock)); // "true"/"false"
    }

    return this.http.get<PaginatedResponse<Product>>(
      `${this.apiUrl}/products`,
      { params },
    );
  }

  /** ACCIONES CRUD **/
  createProduct(payload: {
    name: string;
    description?: string | null;
    price?: number;
    website?: string | null;
    imagen_url?: string | null;
    stock?: number;
    category_id: number;
    id_compania: number;
  }): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, payload);
  }

  updateProduct(
    id: number,
    payload: Partial<{
      name: string;
      description: string | null;
      price: number;
      website: string | null;
      imagen_url: string | null;
      stock: number;
      category_id: number;
      id_compania: number;
    }>,
  ): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, payload);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/products/${id}`,
    );
  }

  /** Combos categorias y compañias **/
  getCategories(
    q?: string,
  ): Observable<CategoryMini[] | PaginatedResponse<CategoryMini>> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    // Paginado o sin paginar
    return this.http.get<CategoryMini[]>(`${this.apiUrl}/categories`, {
      params,
    });
  }

  getCompanies(
    q?: string,
  ): Observable<CompanyMini[] | PaginatedResponse<CompanyMini>> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<CompanyMini[]>(`${this.apiUrl}/companias`, { params });
  }
}

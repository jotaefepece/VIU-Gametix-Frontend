import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/products';  // ← tu Laravel

	getAll() {
	  return this.http.get<Producto[]>(this.apiUrl).pipe(
		map((productos: any[]) =>
		  productos.map(p => ({
			...p,
			id_producto: p.id_producto ?? p.id   // 🔥 NORMALIZACIÓN
		  }))
		)
	  );
	}


  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }
}

/*import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ProductoService } from '../services/producto.service';
import { CarritoService } from '../services/carrito.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';

import { Producto } from '../models/producto.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // 👈 IMPORTANTE
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {

  categorias: any[] = [];
  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaSeleccionada: any = null;
  filtroTexto = '';
  loading = false;
  error: string | null = null;

  // ✅ INJECT MODERNO (FUERA DEL CONSTRUCTOR)
  private authService = inject(AuthService);

  constructor(
    private http: HttpClient,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarTodosLosProductos();
  }

  cargarCategorias() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8000/api/categories').subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar categorías';
        this.loading = false;
      }
    });
  }

  // ✅ NORMALIZACIÓN CORRECTA
  cargarTodosLosProductos() {
    this.productoService.getAll().subscribe({
      next: (productos) => {

        this.todosLosProductos = productos.map((p: any, index: number) => ({
          ...p,
          id_producto: p.id_producto ?? p.id ?? index + 1,
          category_id: p.category_id ?? p.categoria_id // fallback API
        }));

        console.log('PRODUCTOS CATEGORIAS', this.todosLosProductos);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  seleccionarCategoria(categoria: any) {
    this.categoriaSeleccionada = categoria;
    this.filtroTexto = '';
    this.filtrarProductos();
  }

  filtrarPorTexto(event: any) {
    this.filtroTexto = event.target.value.toLowerCase();
    this.filtrarProductos();
  }

  filtrarProductos() {
    if (!this.categoriaSeleccionada || !this.todosLosProductos.length) {
      this.productosFiltrados = [];
      return;
    }

    this.productosFiltrados = this.todosLosProductos.filter(p =>
      p.category_id === this.categoriaSeleccionada.id &&
      p.name?.toLowerCase().includes(this.filtroTexto)
    );
  }

  // ✅ PROTECCIÓN AUTH
  agregarAlCarrito(producto: Producto) {
    this.authService.requireLogin(() => {
      this.carritoService.agregarProducto(producto);
    });
  }

  toggleListaDeseos(producto: Producto) {
    this.authService.requireLogin(() => {
      this.wishlistService.toggleProducto(producto);
    });
  }

  estaEnListaDeseos(id: number): boolean {
    return this.wishlistService.estaEnWishlist(id);
  }
}

*/
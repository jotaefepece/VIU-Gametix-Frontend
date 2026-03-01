import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WishlistService, ListaDeseo } from '../services/wishlist.service';

@Component({
  selector: 'app-lista-deseos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-deseos.component.html',
  styleUrls: ['./lista-deseos.component.css'],
})
export class ListaDeseosComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  saving = false;
  errorMsg = '';
  okMsg = '';

  // lista
  idLista: number | null = null;
  lista: ListaDeseo | null = null;

  // inputs (nombre/descripcion)
  nombre = '';
  descripcion: string | null = null;

  // productos
  productos: any[] = [];

  ngOnInit(): void {
    this.inicializar();
  }

  private inicializar(): void {
    // Ruta (para el futuro) /lista-deseos/123
    const idParam = this.route.snapshot.paramMap.get('id');
    const idFromRoute = idParam ? Number(idParam) : null;

    // Por localStorage (actual)
    const idFromStorage = localStorage.getItem('id_lista')
      ? Number(localStorage.getItem('id_lista'))
      : null;

    const id = idFromRoute || idFromStorage;

    if (!id || Number.isNaN(id)) {
      // Modo "crear" sin id 
      this.idLista = null;
      this.lista = null;
      this.nombre = '';
      this.descripcion = null;
      this.productos = [];
      return;
    }

    this.idLista = id;

    // carga data de la lista y productos
    this.cargarListaYProductos();
  }

  private cargarListaYProductos(): void {
    if (!this.idLista) return;

    this.loading = true;
    this.errorMsg = '';
    this.okMsg = '';

    // Datos de la lista (nombre/descripcion)
    this.wishlistService.obtenerLista(this.idLista).subscribe({
      next: (lista) => {
        this.lista = lista;
        this.nombre = lista.nombre ?? '';
        this.descripcion = lista.descripcion ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo cargar la lista.';
        this.loading = false;
      },
    });

    // Productos de la lista
    this.wishlistService.obtenerProductos(this.idLista).subscribe({
      next: (data) => (this.productos = data),
      error: (err) => console.error('Error cargando productos:', err),
    });
  }

  guardar(): void {
    this.okMsg = '';
    this.errorMsg = '';

    const payload = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion?.trim() || null,
    };

    if (!payload.nombre) {
      this.errorMsg = 'El nombre es obligatorio.';
      return;
    }

    this.saving = true;

    // Si existe id = PATCH / UPDATE
    if (this.idLista) {
      this.wishlistService.actualizarLista(this.idLista, payload).subscribe({
        next: (updated) => {
          this.lista = updated;
          this.nombre = updated.nombre ?? this.nombre;
          this.descripcion = updated.descripcion ?? this.descripcion;
          this.okMsg = 'Lista guardada ✅';
          this.saving = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'No se pudo guardar la lista.';
          this.saving = false;
        },
      });
      return;
    }

    // Si no hay id  CREATE y guarda id en localStorage para que ya quede “activa”
    this.wishlistService.crearLista(payload).subscribe({
      next: (created) => {
        this.lista = created;
        this.idLista = created.id_lista;

        localStorage.setItem('id_lista', String(created.id_lista));

        this.okMsg = 'Lista creada ✅';
        this.saving = false;

        // Puede ser para futuro (actual no) /lista-deseos/:id
        // this.router.navigate(['/lista-deseos', created.id_lista]);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo crear la lista.';
        this.saving = false;
      },
    });
  }

  eliminarProductoDeLista(producto: any): void {
    if (!this.idLista) return;

    const ok = confirm(`¿Quitar "${producto.name}" de la lista?`);
    if (!ok) return;

    this.wishlistService.eliminarProducto(this.idLista, producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error eliminando producto:', err),
    });
  }

  private cargarProductos(): void {
    if (!this.idLista) return;

    this.wishlistService.obtenerProductos(this.idLista).subscribe({
      next: (data) => (this.productos = data),
      error: (err) => console.error('Error cargando productos:', err),
    });
  }

  eliminarLista(): void {
    if (!this.idLista) return;

    const ok = confirm('¿Eliminar esta lista completa?');
    if (!ok) return;

    this.loading = true;
    this.wishlistService.eliminarLista(this.idLista).subscribe({
      next: () => {
        this.loading = false;
        localStorage.removeItem('id_lista');
        this.idLista = null;
        this.lista = null;
        this.nombre = '';
        this.descripcion = null;
        this.productos = [];
        this.okMsg = 'Lista eliminada ✅';
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudo eliminar la lista.';
        this.loading = false;
      },
    });
  }

  trackById = (_: number, item: any) => item?.id;
}
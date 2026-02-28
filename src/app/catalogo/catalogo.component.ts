import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/producto.service';
import { Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';



@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {

  productosDestacados: Product[] = [];
  mejoresValorados: Product[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.productosDestacados = data;
        this.mejoresValorados = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
      }
    });
  }


  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

agregarALista(producto: Product) {
 

  //console.log(producto);
  //console.log(JSON.parse(usuarioString));

  if (!this.estaLogueado()) {
    this.router.navigate(['/login']);
    return;
  }

  const usuarioString = localStorage.getItem('user');
  if (!usuarioString) return;

  const usuario = JSON.parse(usuarioString);
  const idUsuario = usuario.id;

  const idListaStorage = localStorage.getItem('id_lista');
let idLista = idListaStorage ? parseInt(idListaStorage, 10) : null;


  if (!idLista) {

    const dataLista = {
      id_usuario: idUsuario,
      nombre: 'Deseos 2026',
      descripcion: 'Jueguitos y accesorios que quiero comprar'
    };

    this.wishlistService.crearLista(dataLista).subscribe({
      next: (lista) => {

         //console.log('Respuesta crearLista:', lista);
        localStorage.setItem('id_lista', lista.id_lista.toString());
        idLista = lista.id_lista;

        
       if (idLista !== null) {
        this.agregarProductoALista(idLista, producto);
      }

      },
      error: (err) => {
        console.error('Error creando lista', err);
      }
    });

  } else {

    this.agregarProductoALista( idLista, producto);

  }
}

private agregarProductoALista(idLista: number, producto: Product) {

  this.wishlistService.agregarProducto(idLista, producto.id)
    .subscribe({
      next: (response) => {
        console.log('Producto agregado correctamente', response);
      },
      error: (err) => {
        console.error('Error agregando producto', err);
      }
    });


}


}


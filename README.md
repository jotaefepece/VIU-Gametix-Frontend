# 🎮 GAMETIX Frontend

Frontend del sistema **GAMETIX**, una aplicación web de comercio electrónico desarrollada 
como parte del proceso formativo del Máster en la Universidad Internacional de Valencia (VIU).

Este proyecto consume una API REST desarrollada en Laravel para la gestión de productos, 
categorías, proveedores, carrito de compras y lista de deseos.

---

## Tecnologías utilizadas

- **Angular 19**
- TypeScript
- HTML5 / CSS3
- Signals (Angular reactivity)
- Standalone Components
- Angular Router
- LocalStorage (persistencia de sesión simulada)
- API REST (Laravel backend)

---

## Backend (API REST)

El backend está desarrollado por gran socio colaborador y miembro del equipo y se encuentra en el siguiente repositorio:

**https://github.com/hferrer08/Gametix-API**

> API REST desarrollada en Laravel para un sistema de comercio electrónico, orientada a la gestión de productos, 
proveedores y sus relaciones muchos a muchos.

---

## Funcionalidades implementadas (v1)

### Catálogo de productos
- Listado completo de productos desde la API
- Visualización de imagen, nombre, precio y descripción
- Agregar productos al carrito
- Agregar/Quitar productos de la lista de deseos

### Categorías
- Listado dinámico de categorías desde la API
- Filtrado de productos por categoría
- Búsqueda de productos por texto dentro de una categoría
- Integración con carrito y lista de deseos (estado sincronizado con catálogo)

### Lista de deseos
- Agregar y quitar productos
- Persistencia en LocalStorage
- Sincronización entre catálogo y categorías

### Carrito de compras
- Agregar productos
- Persistencia en LocalStorage
- Visualización del carrito

### Autenticación simulada
- Login simulado (sin backend real)
- Estado de sesión persistente en LocalStorage
- Protección de acciones (carrito y wishlist requieren login)
- Navbar reactivo según estado de sesión

---

## Funcionalidades pendientes / en desarrollo

### Autenticación real - pendiente
- Integración con backend Laravel (JWT o Sanctum)
- Registro real de usuarios
- Roles y permisos (usuario / admin)

### Carrito persistente en backend
- Guardar carrito por usuario en base de datos
- Sincronización multi-dispositivo

### Wishlist persistente en backend
- Guardar lista de deseos por usuario autenticado

### Checkout y pagos - pendiente
- Flujo de compra
- Integración con pasarela de pago (simulada o real)

### Panel de administración - pendiente
- Gestión de productos
- Gestión de categorías
- Gestión de proveedores

### Testing
- Unit tests (Jasmine/Karma)
- E2E tests (Cypress o Playwright)

---

## Instalación y ejecución

### 1Clonar el repositorio

```bash
git clone https://github.com/jotaefepece/Master-Web-VIU.git
cd Master-Web-VIU/c05-webFronted/gametix-frontend

```

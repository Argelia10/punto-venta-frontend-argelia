export interface Producto {
  idProducto: number | null;
  nombre: string;
  descripcion: string;
  precio: number | string;
  stock: number | string;
  idCategoria?: {
    idCategoria: number;
  } | null;
}
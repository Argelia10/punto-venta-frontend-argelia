import api from "../api/axios";
import type { Producto } from "../types/producto";

export const listarProductosActivos = () =>
  api.get<Producto[]>("/productos/mostrarActivos");

export const crearProducto = (data: Omit<Producto, "idProducto">) =>
  api.post<Producto>("/productos", { ...data, estado: true }); // <-- AÑADIDO estado: true

export const actualizarProducto = (
  id: number,
  data: Omit<Producto, "idProducto">,
) => api.put<Producto>(`/productos/${id}`, { ...data, estado: true }); // <-- AÑADIDO estado: true

export const anularProducto = (id: number) =>
  api.put<Producto>(`/productos/anular/${id}`);
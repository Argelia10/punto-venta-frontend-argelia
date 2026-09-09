import api from "../api/axios";
import type { Cliente } from "../types/cliente";

export const listarClientesActivos = () =>
  api.get<Cliente[]>("/clientes/mostrarActivos");

export const crearCliente = (data: Omit<Cliente, "idCliente">) =>
  api.post<Cliente>("/clientes", { ...data, estado: true }); // <-- AÑADIDO estado: true

export const actualizarCliente = (
  id: number,
  data: Omit<Cliente, "idCliente">,
) => api.put<Cliente>(`/clientes/${id}`, { ...data, estado: true }); // <-- AÑADIDO estado: true

export const anularCliente = (id: number) =>
  api.put<Cliente>(`/clientes/anular/${id}`);
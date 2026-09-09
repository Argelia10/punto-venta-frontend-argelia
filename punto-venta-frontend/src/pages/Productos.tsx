import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto
} from "../services/productoServices";
import type { Producto } from "../types/producto";

const formInicial: Producto = {
  idProducto: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: ""
};

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Producto>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.mensaje ?? error.message;
      if (msg.includes("Duplicate entry") || msg.includes("UNIQUE")) {
        return "Error: El producto ya existe";
      }
      return msg;
    }
    return "Error al procesar la solicitud";
  };

  const cargarProductos = async () => {
    try {
      const respuesta = await listarProductosActivos();
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error al listar productos", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Estructura adaptada exactamente para el ProductoDTO de tu Spring Boot
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        estado: true,
        idCategoria: 1 // ID numérico simple de categoría existente
      };

      let respuesta;

      if (modoEdicion && form.idProducto !== null) {
        respuesta = await actualizarProducto(form.idProducto, payload as any);
      } else {
        respuesta = await crearProducto(payload as any);
      }

      setMensaje(respuesta.data?.mensaje || "Operación realizada con éxito");
      setForm(formInicial);
      setModoEdicion(false);
      cargarProductos();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
    }
  };

  const handleModificar = (p: Producto) => {
    setForm(p);
    setModoEdicion(true);
  };

  const handleAnular = async (idProducto: number) => {
    if (!window.confirm("¿Seguro que deseas anular este producto?")) return;
    try {
      await anularProducto(idProducto);
      setMensaje("Producto anulado correctamente");
      cargarProductos();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
    }
  };

  return (
    <div>
      <h2>Ingresar/Modificar Productos</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre: </label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label>Descripción: </label>
          <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </div>
        <div>
          <label>Precio: </label>
          <input type="number" name="precio" value={form.precio} onChange={handleChange} required />
        </div>
        <div>
          <label>Stock: </label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
        </div>
        <button type="submit">Guardar</button>
      </form>

      <h2>Listado de Productos</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.idProducto}>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => handleModificar(p)}>Modificar</button></td>
              <td>
                <button onClick={() => p.idProducto !== null && handleAnular(p.idProducto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
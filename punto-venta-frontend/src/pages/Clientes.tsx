import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import {
  listarClientesActivos,
  crearCliente,
  actualizarCliente,
  anularCliente
} from "../services/clienteServices";
import type { Cliente } from "../types/cliente";

const formInicial: Cliente = {
  idCliente: null,
  nombre: "",
  apellido: "",
  email: "",
  telefono: ""
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.mensaje ?? error.message;
      if (msg.includes("Duplicate entry") || msg.includes("UNIQUE")) {
        return "Error: El cliente ya existe";
      }
      return msg;
    }
    return "Error al procesar la solicitud";
  };

  const cargarClientes = async () => {
    try {
      const respuesta = await listarClientesActivos();
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al listar clientes", error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { idCliente, ...datosForm } = form;
      let respuesta;
      
      if (modoEdicion && idCliente !== null) {
        respuesta = await actualizarCliente(idCliente, datosForm);
      } else {
        respuesta = await crearCliente(datosForm);
      }
      
      setMensaje((respuesta.data as any)?.mensaje || "Operación realizada con éxito");
      setForm(formInicial);
      setModoEdicion(false);
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
    }
  };

  const handleModificar = (cliente: Cliente) => {
    setForm(cliente);
    setModoEdicion(true);
  };

  const handleAnular = async (idCliente: number) => {
    if (!window.confirm("¿Seguro que deseas anular este cliente?")) return;
    try {
      await anularCliente(idCliente);
      setMensaje("Cliente anulado correctamente");
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
    }
  };

  return (
    <div>
      <h2>Ingresar/Modificar Clientes</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre: </label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>
        <div>
          <label>Apellido: </label>
          <input type="text" name="apellido" value={form.apellido} onChange={handleChange} />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label>Teléfono: </label>
          <input type="text" name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <button type="submit">Guardar</button>
      </form>

      <h2>Listado de Clientes</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.idCliente}>
              <td>{c.nombre}</td>
              <td>{c.apellido}</td>
              <td>{c.email}</td>
              <td>{c.telefono}</td>
              <td><button onClick={() => handleModificar(c)}>Modificar</button></td>
              <td>
                <button onClick={() => c.idCliente !== null && handleAnular(c.idCliente)}>
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

export default Clientes;
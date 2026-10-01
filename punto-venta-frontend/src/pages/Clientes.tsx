import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

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
      const msg = (error.response?.data as { mensaje?: string })?.mensaje ?? error.message;
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
      let respuesta: any;
      
      if (modoEdicion && idCliente !== null) {
        respuesta = await actualizarCliente(idCliente, datosForm);
      } else {
        respuesta = await crearCliente(datosForm);
      }
      
      setMensaje(respuesta.data?.mensaje || "Operación realizada con éxito");
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

  // ==========================================
  // REPORTES PDF Y EXCEL
  // ==========================================

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(219, 39, 119);
    doc.text("Listado de Clientes", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const columnas = ["Nombre", "Apellido", "Email", "Teléfono"];
    const filas = clientes.map((c) => [c.nombre, c.apellido, c.email, c.telefono]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 26,
      theme: "striped",
      headStyles: { fillColor: [219, 39, 119], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [252, 231, 243] },
      styles: { fontSize: 10, cellPadding: 3, textColor: [50, 50, 50] },
      margin: { top: 20, left: 14, right: 14 }
    });

    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: "center" });
    }

    return doc;
  };

  const exportarPDF = () => generarPDF().save("Reporte_Clientes.pdf");

  const verPDF = () => {
    const url = generarPDF().output("bloburl");
    window.open(url, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Clientes");

    const titulo = hoja.addRow(["Listado de Clientes"]);
    titulo.font = { size: 16, bold: true, color: { argb: "FFDB2777" } };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["Nombre", "Apellido", "Email", "Teléfono"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDB2777" } };
      celda.border = {
        top: { style: "thin", color: { argb: "FFFBCFE8" } },
        left: { style: "thin", color: { argb: "FFFBCFE8" } },
        bottom: { style: "thin", color: { argb: "FFFBCFE8" } },
        right: { style: "thin", color: { argb: "FFFBCFE8" } }
      };
    });

    clientes.forEach((c, idx) => {
      const fila = hoja.addRow([c.nombre, c.apellido, c.email, c.telefono]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin", color: { argb: "FFFBCFE8" } },
          left: { style: "thin", color: { argb: "FFFBCFE8" } },
          bottom: { style: "thin", color: { argb: "FFFBCFE8" } },
          right: { style: "thin", color: { argb: "FFFBCFE8" } }
        };
        if (idx % 2 === 1) {
          celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE7F3" } };
        }
      });
    });

    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 25;
    hoja.getColumn(3).width = 35;
    hoja.getColumn(4).width = 20;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "Reporte_Clientes.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-pink-200">
          <h2 className="text-2xl font-extrabold text-pink-600 mb-6 italic border-b border-pink-100 pb-2">
            Ingresar/Modificar Clientes
          </h2>

          {mensaje && (
            <div className="mb-6 p-3 bg-pink-100/90 border border-pink-300 text-pink-800 rounded-lg font-medium text-sm shadow-sm">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <label className="font-bold text-pink-900 min-w-[80px]">Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                />
              </div>

              <div className="flex items-center space-x-3">
                <label className="font-bold text-pink-900 min-w-[80px]">Apellido:</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                />
              </div>

              <div className="flex items-center space-x-3">
                <label className="font-bold text-pink-900 min-w-[80px]">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                />
              </div>

              <div className="flex items-center space-x-3">
                <label className="font-bold text-pink-900 min-w-[80px]">Teléfono:</label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition duration-200 transform active:scale-95"
            >
              Guardar
            </button>
          </form>
        </div>

        {/* Tabla y Reportes */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-pink-200">
          <h2 className="text-2xl font-extrabold text-pink-600 mb-6 italic border-b border-pink-100 pb-2">
            Listado de Clientes
          </h2>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={exportarPDF}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition transform active:scale-95"
            >
              📄 Exportar PDF
            </button>

            <button
              onClick={verPDF}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition transform active:scale-95"
            >
              👁️ Ver PDF
            </button>

            <button
              onClick={exportarExcel}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition transform active:scale-95"
            >
              📊 Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-pink-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-pink-200 via-pink-100 to-pink-200 text-pink-950 border-b border-pink-200">
                  <th className="py-3 px-4 font-bold border-r border-pink-200/60">Nombre</th>
                  <th className="py-3 px-4 font-bold border-r border-pink-200/60">Apellido</th>
                  <th className="py-3 px-4 font-bold border-r border-pink-200/60">Email</th>
                  <th className="py-3 px-4 font-bold border-r border-pink-200/60">Teléfono</th>
                  <th className="py-3 px-4 font-bold text-center border-r border-pink-200/60 w-32">Modificar</th>
                  <th className="py-3 px-4 font-bold text-center w-32">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.idCliente} className="border-b border-pink-100 hover:bg-pink-50/70 transition">
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-700 font-medium">{c.nombre}</td>
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-700 font-medium">{c.apellido}</td>
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-600">{c.email}</td>
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-600">{c.telefono}</td>
                    <td className="py-2.5 px-3 text-center border-r border-pink-100">
                      <button
                        onClick={() => handleModificar(c)}
                        className="w-full bg-pink-200 hover:bg-pink-300 text-pink-900 font-bold py-1.5 px-3 rounded-lg text-sm transition shadow-sm"
                      >
                        Modificar
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => c.idCliente !== null && handleAnular(c.idCliente)}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition shadow-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Clientes;
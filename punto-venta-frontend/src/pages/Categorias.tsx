import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria
} from "../services/categoriaServices";
import type { Categoria } from "../types/categoria";

const formInicial: Categoria = {
  idCategoria: null,
  nombre: "",
  descripcion: ""
};

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Categoria>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const mensajeServidor = (error.response?.data as { mensaje?: string })?.mensaje ?? error.message;

      if (
        mensajeServidor.includes("Duplicate entry") ||
        mensajeServidor.includes("NOMBRE_UNIQUE")
      ) {
        return "Error: La categoría ya existe";
      }

      return mensajeServidor;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Ocurrió un error inesperado";
  };

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al listar categorías", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let respuesta: any;
      if (modoEdicion && form.idCategoria !== null) {
        respuesta = await actualizarCategoria(form.idCategoria, form);
      } else {
        respuesta = await crearCategoria(form);
      }
      setMensaje(respuesta.data?.mensaje || "Operación realizada con éxito");
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar categoría", error);
    }
  };

  const handleModificar = (categoria: Categoria) => {
    setForm(categoria);
    setModoEdicion(true);
  };

  const handleAnular = async (idCategoria: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas anular esta categoría?"
    );
    if (!confirmar) return;
    try {
      await anularCategoria(idCategoria);
      setMensaje("Categoría anulada correctamente");
      cargarCategorias();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular la categoría", error);
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
    doc.text("Listado de Categorías", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const columnas = ["Nombre", "Descripción"];
    const filas = categorias.map((categoria) => [
      categoria.nombre,
      categoria.descripcion
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 26,
      theme: "striped",
      headStyles: {
        fillColor: [219, 39, 119],
        textColor: 255,
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243]
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [50, 50, 50]
      },
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

  const exportarPDF = () => generarPDF().save("Reporte_Categorias.pdf");

  const verPDF = () => {
    const url = generarPDF().output("bloburl");
    window.open(url, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Categorías");

    const titulo = hoja.addRow(["Listado de Categorías"]);
    titulo.font = { size: 16, bold: true, color: { argb: "FFDB2777" } };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["Nombre", "Descripción"]);
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

    categorias.forEach((categoria, indice) => {
      const fila = hoja.addRow([categoria.nombre, categoria.descripcion]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin", color: { argb: "FFFBCFE8" } },
          left: { style: "thin", color: { argb: "FFFBCFE8" } },
          bottom: { style: "thin", color: { argb: "FFFBCFE8" } },
          right: { style: "thin", color: { argb: "FFFBCFE8" } }
        };
        if (indice % 2 === 1) {
          celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE7F3" } };
        }
      });
    });

    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 60;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "Reporte_Categorias.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-pink-200">
          <h2 className="text-2xl font-extrabold text-pink-600 mb-6 italic border-b border-pink-100 pb-2">
            Ingresar / Modificar Categorías
          </h2>

          {mensaje && (
            <div className="mb-6 p-3 bg-pink-100/90 border border-pink-300 text-pink-800 rounded-lg font-medium text-sm shadow-sm">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <label htmlFor="nombre" className="font-bold text-pink-900 min-w-[80px]">
                  Nombre:
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <label htmlFor="descripcion" className="font-bold text-pink-900 min-w-[90px]">
                  Descripción:
                </label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-gray-800 shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition duration-200 transform active:scale-95"
            >
              {modoEdicion ? "Actualizar" : "Guardar"}
            </button>
          </form>
        </div>

        {/* Tabla y Reportes */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-pink-200">
          <h2 className="text-2xl font-extrabold text-pink-600 mb-6 italic border-b border-pink-100 pb-2">
            Listado de Categorías
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
                  <th className="py-3 px-4 font-bold border-r border-pink-200/60">Descripción</th>
                  <th className="py-3 px-4 font-bold text-center border-r border-pink-200/60 w-32">Modificar</th>
                  <th className="py-3 px-4 font-bold text-center w-32">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr
                    key={categoria.idCategoria}
                    className="border-b border-pink-100 hover:bg-pink-50/70 transition"
                  >
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-700 font-medium">{categoria.nombre}</td>
                    <td className="py-3 px-4 border-r border-pink-100 text-gray-600">{categoria.descripcion}</td>
                    <td className="py-2.5 px-3 text-center border-r border-pink-100">
                      <button
                        onClick={() => handleModificar(categoria)}
                        className="w-full bg-pink-200 hover:bg-pink-300 text-pink-900 font-bold py-1.5 px-3 rounded-lg text-sm transition shadow-sm"
                      >
                        Modificar
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() =>
                          categoria.idCategoria !== null && handleAnular(categoria.idCategoria)
                        }
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

export default Categorias;
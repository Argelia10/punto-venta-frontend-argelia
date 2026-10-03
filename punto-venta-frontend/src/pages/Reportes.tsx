import { useState } from "react";
import { buscarProductosPorNombre, listarProductosActivos } from "../services/productoServices";
import { listarCategoriasActivas, buscarCategoriasPorNombre } from "../services/categoriaServices";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reportes() {
  // Estado para la ventana modal de Filtro Productos
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [nombreFiltroProducto, setNombreFiltroProducto] = useState("");

  // Estado para la ventana modal de Filtro Categorías
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [nombreFiltroCategoria, setNombreFiltroCategoria] = useState("");

  // 1. REPORTE GENERAL DE PRODUCTOS EN PDF
  const handleReporteProductosPDF = async () => {
    try {
      const response = await listarProductosActivos();
      const productos = response.data;

      const doc = new jsPDF();
      
      // Encabezado Rosado
      doc.setFillColor(232, 98, 143); // Rosa principal
      doc.rect(0, 0, 210, 25, "F");
      
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte General de Productos", 14, 16);

      const filas = productos.map((p: any) => [
        p.idProducto || "",
        p.nombre || "",
        p.descripcion || "",
        p.precio ? `$${p.precio}` : "",
        p.stock || ""
      ]);

      autoTable(doc, {
        startY: 32,
        head: [["ID", "Nombre", "Descripción", "Precio", "Stock"]],
        body: filas,
        headStyles: {
          fillColor: [232, 98, 143],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248] // Rosa muy suave
        }
      });

      doc.save("Reporte_General_Productos.pdf");
    } catch (error) {
      console.error("Error al generar PDF de productos:", error);
      alert("Error al obtener los productos para el PDF.");
    }
  };

  // 2. REPORTE GENERAL DE CATEGORÍAS EN PDF
  const handleReporteCategoriasPDF = async () => {
    try {
      const response = await listarCategoriasActivas();
      const categorias = response.data;

      const doc = new jsPDF();
      
      // Encabezado Rosado
      doc.setFillColor(232, 98, 143);
      doc.rect(0, 0, 210, 25, "F");

      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte General de Categorías", 14, 16);

      const filas = categorias.map((c: any) => [
        c.idCategoria || c.id || "",
        c.nombre || "",
        c.descripcion || ""
      ]);

      autoTable(doc, {
        startY: 32,
        head: [["ID", "Nombre", "Descripción"]],
        body: filas,
        headStyles: {
          fillColor: [232, 98, 143],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save("Reporte_General_Categorias.pdf");
    } catch (error) {
      console.error("Error al generar PDF de categorías:", error);
      alert("Error al obtener las categorías para el PDF.");
    }
  };

  // 3. EXPORTAR PDF CON FILTRO DE PRODUCTOS
  const handleExportarPdfProducto = async () => {
    try {
      const respuesta = await buscarProductosPorNombre(nombreFiltroProducto);
      const productos = respuesta.data;

      const doc = new jsPDF();
      
      doc.setFillColor(232, 98, 143);
      doc.rect(0, 0, 210, 25, "F");

      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Productos Filtrado", 14, 16);

      if (nombreFiltroProducto.trim() !== "") {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtro por nombre: "${nombreFiltroProducto}"`, 14, 33);
      }

      const filas = productos.map((p: any) => [
        p.idProducto || "",
        p.nombre || "",
        p.descripcion || "",
        p.precio ? `$${p.precio}` : "",
        p.stock || ""
      ]);

      autoTable(doc, {
        startY: nombreFiltroProducto.trim() !== "" ? 38 : 32,
        head: [["ID", "Nombre", "Descripción", "Precio", "Stock"]],
        body: filas,
        headStyles: {
          fillColor: [232, 98, 143],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save(`Reporte_Productos_${nombreFiltroProducto || "Todos"}.pdf`);
      setMostrarModalProducto(false);
    } catch (error) {
      console.error("Error al filtrar productos:", error);
      alert("Ocurrió un error al generar el PDF filtrado.");
    }
  };

  // 4. EXPORTAR PDF CON FILTRO DE CATEGORÍAS
  const handleExportarPdfCategoria = async () => {
    try {
      const respuesta = await buscarCategoriasPorNombre(nombreFiltroCategoria);
      const categorias = respuesta.data;

      const doc = new jsPDF();

      doc.setFillColor(232, 98, 143);
      doc.rect(0, 0, 210, 25, "F");

      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Categorías Filtrado", 14, 16);

      if (nombreFiltroCategoria.trim() !== "") {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtro por nombre: "${nombreFiltroCategoria}"`, 14, 33);
      }

      const filas = categorias.map((c: any) => [
        c.idCategoria || c.id || "",
        c.nombre || "",
        c.descripcion || ""
      ]);

      autoTable(doc, {
        startY: nombreFiltroCategoria.trim() !== "" ? 38 : 32,
        head: [["ID", "Nombre", "Descripción"]],
        body: filas,
        headStyles: {
          fillColor: [232, 98, 143],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save(`Reporte_Categorias_${nombreFiltroCategoria || "Todas"}.pdf`);
      setMostrarModalCategoria(false);
    } catch (error) {
      console.error("Error al filtrar categorías:", error);
      alert("Ocurrió un error al generar el PDF de categorías filtradas.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#fff5f8", minHeight: "100vh" }}>
      <h2 style={{ color: "#d63384", marginBottom: "20px" }}>🌸 Panel de Reportes</h2>
      
      {/* Botones de la pantalla */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        
        <button style={btnEstiloRosa} onClick={handleReporteProductosPDF}>
          Reporte Productos PDF
        </button>

        <button style={btnEstiloRosa} onClick={handleReporteCategoriasPDF}>
          Reporte Categorías PDF
        </button>

        <button 
          style={btnEstiloRosa} 
          onClick={() => {
            setNombreFiltroCategoria("");
            setMostrarModalCategoria(true);
          }}
        >
          Filtro Categorías
        </button>
        
        <button 
          style={btnEstiloRosa} 
          onClick={() => {
            setNombreFiltroProducto("");
            setMostrarModalProducto(true);
          }}
        >
          Filtro Productos
        </button>
      </div>

      {/* VENTANA MODAL - FILTRO PRODUCTOS */}
      {mostrarModalProducto && (
        <div style={overlayEstilo}>
          <div style={modalEstilo}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#d63384" }}>
              Reporte de productos
            </h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555" }}>
                Nombre:
              </label>
              <input 
                type="text" 
                value={nombreFiltroProducto}
                onChange={(e) => setNombreFiltroProducto(e.target.value)}
                placeholder="Ingrese el nombre..."
                style={inputEstilo}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => setMostrarModalProducto(false)}
                style={{ ...btnAccion, backgroundColor: "#6c757d" }}
              >
                Cerrar
              </button>
              <button 
                onClick={handleExportarPdfProducto}
                style={{ ...btnAccion, backgroundColor: "#e8628f" }}
              >
                Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA MODAL - FILTRO CATEGORÍAS */}
      {mostrarModalCategoria && (
        <div style={overlayEstilo}>
          <div style={modalEstilo}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#d63384" }}>
              Reporte de categorías
            </h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555" }}>
                Nombre:
              </label>
              <input 
                type="text" 
                value={nombreFiltroCategoria}
                onChange={(e) => setNombreFiltroCategoria(e.target.value)}
                placeholder="Ingrese el nombre..."
                style={inputEstilo}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => setMostrarModalCategoria(false)}
                style={{ ...btnAccion, backgroundColor: "#6c757d" }}
              >
                Cerrar
              </button>
              <button 
                onClick={handleExportarPdfCategoria}
                style={{ ...btnAccion, backgroundColor: "#e8628f" }}
              >
                Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ESTILOS EN TONOS ROSA
const btnEstiloRosa = {
  backgroundColor: "#e8628f",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "bold" as const,
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 3px 6px rgba(232, 98, 143, 0.3)",
  transition: "all 0.2s ease"
};

const overlayEstilo: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalEstilo: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "340px",
  boxShadow: "0 5px 15px rgba(232, 98, 143, 0.2)",
  borderTop: "5px solid #e8628f"
};

const inputEstilo: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  boxSizing: "border-box",
  borderRadius: "6px",
  border: "1px solid #f3c2d3",
  outline: "none"
};

const btnAccion = {
  color: "white",
  border: "none",
  padding: "9px 16px",
  borderRadius: "6px",
  fontWeight: "bold" as const,
  cursor: "pointer"
};
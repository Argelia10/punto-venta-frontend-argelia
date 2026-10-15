import { useState } from "react";
import { buscarProductosPorNombre, listarProductosActivos } from "../services/productoServices";
import { listarCategoriasActivas, buscarCategoriasPorNombre } from "../services/categoriaServices";
import { listarClientesActivos } from "../services/clienteServices";
import { listarPedidos } from "../services/pedidoServices";
import { obtenerReporteDetalle } from "../services/pedidoDetalleServices";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reportes() {
  // Estado para la ventana modal de Filtro Productos
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [nombreFiltroProducto, setNombreFiltroProducto] = useState("");

  // Estado para la ventana modal de Filtro Categorías
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [nombreFiltroCategoria, setNombreFiltroCategoria] = useState("");

  // Función auxiliar para formatear la moneda en Quetzales (Q)
  const formatearQ = (monto: any) => {
    if (monto === null || monto === undefined || monto === "") return "Q0.00";
    const num = parseFloat(monto);
    return isNaN(num) ? "Q0.00" : `Q${num.toFixed(2)}`;
  };

  // ==========================================
  // FUNCIONES DE GENERACIÓN DE REPORTE (PDF)
  // ==========================================

  // 1. REPORTE GENERAL DE PRODUCTOS EN PDF
  const handleReporteProductosPDF = async () => {
    try {
      const response = await listarProductosActivos();
      const productos = response.data;

      const doc = new jsPDF();
      
      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte General de Productos", 14, 18);

      const filas = productos.map((p: any) => [
        p.idProducto || "",
        p.nombre || "",
        p.descripcion || "",
        formatearQ(p.precio),
        p.stock || ""
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Nombre", "Descripción", "Precio", "Stock"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
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
      
      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte General de Categorías", 14, 18);

      const filas = categorias.map((c: any) => [
        c.idCategoria || c.id || "",
        c.nombre || "",
        c.descripcion || ""
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Nombre", "Descripción"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
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
      
      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Productos Filtrado", 14, 18);

      if (nombreFiltroProducto.trim() !== "") {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtro por nombre: "${nombreFiltroProducto}"`, 14, 35);
      }

      const filas = productos.map((p: any) => [
        p.idProducto || "",
        p.nombre || "",
        p.descripcion || "",
        formatearQ(p.precio),
        p.stock || ""
      ]);

      autoTable(doc, {
        startY: nombreFiltroProducto.trim() !== "" ? 40 : 35,
        head: [["ID", "Nombre", "Descripción", "Precio", "Stock"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
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

      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Categorías Filtrado", 14, 18);

      if (nombreFiltroCategoria.trim() !== "") {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtro por nombre: "${nombreFiltroCategoria}"`, 14, 35);
      }

      const filas = categorias.map((c: any) => [
        c.idCategoria || c.id || "",
        c.nombre || "",
        c.descripcion || ""
      ]);

      autoTable(doc, {
        startY: nombreFiltroCategoria.trim() !== "" ? 40 : 35,
        head: [["ID", "Nombre", "Descripción"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
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

  // 5. REPORTE 1: PRODUCTO CATEGORÍA
  const handleReporteProductoCategoria = async () => {
    try {
      const response = await listarProductosActivos();
      const productos = response.data;

      const doc = new jsPDF();

      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte Producto Categoría", 14, 18);

      const filas = productos.map((p: any) => {
        let categoriaTexto = "Sin Categoría";
        if (p.idCategoria && typeof p.idCategoria === "object") {
          categoriaTexto = p.idCategoria.nombre || "Sin Categoría";
        } else if (p.nombreCategoria) {
          categoriaTexto = p.nombreCategoria;
        } else if (p.idCategoria) {
          categoriaTexto = `Categoría #${p.idCategoria}`;
        }

        return [
          p.idProducto || "",
          p.nombre || "",
          p.descripcion || "",
          formatearQ(p.precio),
          p.stock || "",
          categoriaTexto
        ];
      });

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Producto", "Descripción", "Precio", "Stock", "Categoría"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save("Reporte_Producto_Categoria.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al obtener los datos para el reporte.");
    }
  };

  // 6. REPORTE 2: PEDIDO CLIENTE (Obtiene el nombre real del cliente)
  const handleReportePedidoCliente = async () => {
    try {
      const [resPedidos, resClientes] = await Promise.all([
        listarPedidos(),
        listarClientesActivos()
      ]);

      const pedidos = resPedidos.data;
      const clientes = resClientes.data;

      // Mapa de clientes por ID para cruce de nombre completo
      const clienteMap: { [key: number]: string } = {};
      clientes.forEach((c: any) => {
        const id = c.idCliente || c.id;
        const nombreCompleto = `${c.nombre || ""} ${c.apellido || ""}`.trim();
        clienteMap[id] = nombreCompleto || `Cliente #${id}`;
      });

      const doc = new jsPDF();

      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 210, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte Pedido Cliente", 14, 18);

      const filas = pedidos.map((p: any) => {
        const fecha = p.fechaPedido ? new Date(p.fechaPedido).toLocaleDateString() : "";
        
        let nombreCliente = "Sin Cliente";

        if (p.idCliente && typeof p.idCliente === "object") {
          nombreCliente = `${p.idCliente.nombre || ""} ${p.idCliente.apellido || ""}`.trim();
        } else if (p.nombreCliente) {
          nombreCliente = p.nombreCliente;
        } else if (p.idCliente && clienteMap[p.idCliente]) {
          nombreCliente = clienteMap[p.idCliente];
        } else if (p.idCliente) {
          nombreCliente = `Cliente #${p.idCliente}`;
        }

        return [fecha, nombreCliente];
      });

      autoTable(doc, {
        startY: 35,
        head: [["Fecha Pedido", "Nombre Cliente"]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save("Reporte_Pedido_Cliente.pdf");
    } catch (error) {
      console.error("Error al generar PDF de pedidos:", error);
      alert("Error al obtener el reporte de pedidos.");
    }
  };

  // 7. REPORTE 3: PEDIDO CLIENTE DETALLE
  const handleReportePedidoClienteDetalle = async () => {
    try {
      const response = await obtenerReporteDetalle();
      const detalles = response.data;

      const doc = new jsPDF("landscape");

      doc.setFillColor(233, 30, 99);
      doc.rect(0, 0, 297, 28, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte Pedido Cliente Detalle", 14, 18);

      const filas = detalles.map((d: any) => [
        d.fechaPedido ? new Date(d.fechaPedido).toLocaleDateString() : "",
        d.nombreCliente || "",
        d.nombreProducto || "",
        d.cantidadPedido || 0,
        formatearQ(d.precio),
        formatearQ(d.precioUnitario),
        formatearQ(d.subTotal)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [[
          "Fecha Pedido", 
          "Nombre Cliente", 
          "Nombre Producto", 
          "Cantidad Pedido", 
          "Precio", 
          "Precio Unitario", 
          "SubTotal"
        ]],
        body: filas,
        headStyles: {
          fillColor: [233, 30, 99],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [253, 242, 248]
        }
      });

      doc.save("Reporte_Pedido_Cliente_Detalle.pdf");
    } catch (error) {
      console.error("Error al generar PDF de detalle:", error);
      alert("Error al generar el reporte detallado.");
    }
  };

  return (
    <div style={contenedorPrincipalEstilo}>
      <div style={tarjetaEstilo}>
        <h2 style={tituloEstilo}>Generación de Reportes</h2>
        <p style={{ color: "#777", marginBottom: "25px", fontSize: "14px" }}>
          Selecciona cualquiera de las siguientes opciones para descargar la información en formato PDF.
        </p>

        {/* Sección 1: Reportes Principales */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={subtituloSeccionEstilo}>Reportes Generales</h4>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={btnEstiloRosa} onClick={handleReporteProductosPDF}>
              📄 Reporte Productos PDF
            </button>

            <button style={btnEstiloRosa} onClick={handleReporteCategoriasPDF}>
              📄 Reporte Categorías PDF
            </button>

            <button style={btnEstiloRosa} onClick={handleReporteProductoCategoria}>
              📄 Reporte Producto Categoría
            </button>

            <button style={btnEstiloRosa} onClick={handleReportePedidoCliente}>
              📄 Reporte Pedido Cliente
            </button>

            <button style={btnEstiloRosa} onClick={handleReportePedidoClienteDetalle}>
              📄 Reporte Pedido Cliente Detalle
            </button>
          </div>
        </div>

        {/* Sección 2: Filtros Especificos */}
        <div>
          <h4 style={subtituloSeccionEstilo}>Búsqueda con Filtros</h4>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button 
              style={btnEstiloRosaSecundario} 
              onClick={() => {
                setNombreFiltroCategoria("");
                setMostrarModalCategoria(true);
              }}
            >
              🔍 Filtro Categorías
            </button>
            
            <button 
              style={btnEstiloRosaSecundario} 
              onClick={() => {
                setNombreFiltroProducto("");
                setMostrarModalProducto(true);
              }}
            >
              🔍 Filtro Productos
            </button>
          </div>
        </div>
      </div>

      {/* VENTANA MODAL - FILTRO PRODUCTOS */}
      {mostrarModalProducto && (
        <div style={overlayEstilo}>
          <div style={modalEstilo}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#e91e63", fontStyle: "italic", fontWeight: "bold" }}>
              Reporte de productos
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#e91e63", fontSize: "14px" }}>
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
                style={{ ...btnAccion, backgroundColor: "#e91e63" }}
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
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#e91e63", fontStyle: "italic", fontWeight: "bold" }}>
              Reporte de categorías
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#e91e63", fontSize: "14px" }}>
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
                style={{ ...btnAccion, backgroundColor: "#e91e63" }}
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

// ESTILOS VISUALES
const contenedorPrincipalEstilo: React.CSSProperties = {
  padding: "40px 20px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  backgroundColor: "#fcf0f5",
  minHeight: "100vh",
  boxSizing: "border-box"
};

const tarjetaEstilo: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "30px 35px",
  maxWidth: "1100px",
  margin: "0 auto 30px auto",
  boxShadow: "0 10px 25px rgba(233, 30, 99, 0.08)",
  border: "1px solid #f8bbd0"
};

const tituloEstilo: React.CSSProperties = {
  color: "#e91e63",
  fontSize: "26px",
  fontWeight: "bold",
  fontStyle: "italic",
  marginBottom: "10px"
};

const subtituloSeccionEstilo: React.CSSProperties = {
  color: "#c2185b",
  fontSize: "15px",
  fontWeight: "bold",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const btnEstiloRosa: React.CSSProperties = {
  backgroundColor: "#e91e63",
  color: "#ffffff",
  border: "none",
  padding: "12px 22px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(233, 30, 99, 0.25)",
  transition: "all 0.2s ease-in-out"
};

const btnEstiloRosaSecundario: React.CSSProperties = {
  backgroundColor: "#d81b60",
  color: "#ffffff",
  border: "none",
  padding: "12px 22px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(216, 27, 96, 0.25)",
  transition: "all 0.2s ease-in-out"
};

const overlayEstilo: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.35)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalEstilo: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  width: "360px",
  boxShadow: "0 10px 30px rgba(233, 30, 99, 0.2)",
  borderTop: "6px solid #e91e63"
};

const inputEstilo: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #f8bbd0",
  outline: "none",
  fontSize: "14px",
  backgroundColor: "#fff8fa"
};

const btnAccion: React.CSSProperties = {
  color: "#ffffff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "14px",
  cursor: "pointer"
};
import axios from "axios";

const API_URL = "http://localhost:8080/pedido-detalles";

export const obtenerReporteDetalle = () => {
  return axios.get(`${API_URL}/reporte-detalle`);
};
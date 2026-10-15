import axios from "axios";

const API_URL = "http://localhost:8080/pedidos";

export const listarPedidos = () => {
  return axios.get(`${API_URL}/mostrarActivos`);
};
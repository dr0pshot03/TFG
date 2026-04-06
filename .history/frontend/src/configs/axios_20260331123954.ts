import axios from "axios";

// Si no hay variable de entorno, usa proxy de Vite en /api.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
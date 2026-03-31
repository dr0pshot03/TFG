import axios from "axios";

// Si no hay variable de entorno, usamos misma origin y Nginx hace proxy de /api.
const baseURL = import.meta.env.VITE_API_URL || "/";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
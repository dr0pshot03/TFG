import axios from "axios";

// Si existe la variable de entorno (Vercel), usa esa. Si no, usa localhost.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
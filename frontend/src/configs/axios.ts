import axios from "axios";

type IFlavour = "dev" | "prod";

// Base URLs for different environments
const BASE_URLS: Record<IFlavour, string> = {
  dev: "http://localhost:3000",
  prod: "",
};

const flavour: IFlavour = "prod";
const baseUrl = BASE_URLS[flavour];

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
api.interceptors.request.use(
  async (config) => {
    const token = await window?.getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers = config.headers || {};
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);*/

export default api;

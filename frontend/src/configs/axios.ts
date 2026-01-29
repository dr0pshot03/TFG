import axios from "axios";

type IFlavour = "dev" | "prod";

// Base URLs for different environments
const BASE_URLS: Record<IFlavour, string> = {
  dev: "http://localhost:3000",
  prod: "",
};

const flavour: IFlavour = "dev";
const baseUrl = BASE_URLS[flavour];

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

import axios, { AxiosInstance } from "axios";

// Define a tipagem para a instância da API
const api: AxiosInstance = axios.create({
  baseURL: "https://api.pagar.me/core/v5/",
  auth: {
    username: process.env.PAGARME_SECRETE_KEY,
    password: "",
  },
});

export default api;

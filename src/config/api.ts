import axios, { AxiosInstance } from 'axios';

// Define a tipagem para a instância da API
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.pagar.me/core/v5/',
  auth: {
    username: 'sk_643559de2c3d4db497014ef024f5d1dd',
    password: '',
  },
});

export default api;
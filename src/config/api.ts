import axios, { AxiosInstance } from 'axios';

// Define a tipagem para a instância da API
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.pagar.me/core/v5/',
  auth: {
    username: 'sk_b675e9e7687c454b8d52fe632000cb49',
    password: '',
  },
});

export default api;
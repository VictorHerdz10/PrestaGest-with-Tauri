import axios from 'axios';

const publicUrls = ['/auth/login', '/auth/register'];

const getBaseUrl = () => {
  return 'http://localhost:4000/api';
};

// Crear instancia de axios
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    if (publicUrls.some(url => config.url?.includes(url))) {
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;
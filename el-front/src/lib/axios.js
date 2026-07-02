// src/lib/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // La URL de tu backend
});

// Interceptor: Antes de que salga cualquier petición, le inyectamos el token si existe
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
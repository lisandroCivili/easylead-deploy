// src/store/authStore.js
import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
    usuario: null,
    token: null,
    isAuth: false,

    // Función para iniciar sesión
    login: async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, usuario } = res.data;
            
            // Guardamos el token en el navegador
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            // Actualizamos el estado global
            set({ usuario, token, isAuth: true });
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al conectar con el servidor' 
            };
        }
    },

    // Función para registrar un nuevo usuario
    register: async (nombre, email, password) => {
        try {
            await api.post('/auth/registro', { nombre, email, password });
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al registrar el usuario' 
            };
        }
    },

    // Función para cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        set({ usuario: null, token: null, isAuth: false });
    },

    // Función para recuperar la sesión si el usuario recarga la página
    checkAuth: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const usuarioLocal = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
        
        if (token && usuarioLocal) {
            set({ token, usuario: JSON.parse(usuarioLocal), isAuth: true });
        }
    }
}));
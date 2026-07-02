"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft, Users, Megaphone, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const { usuario, isAuth, checkAuth } = useAuthStore();
    const router = useRouter();
    const [metricas, setMetricas] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Le damos un respiro para que cargue el estado
        const timer = setTimeout(() => {
            if (!isAuth) {
                router.push('/login');
                return;
            }
            
            // HU 4.1: Un usuario normal no debe poder acceder bajo ninguna circunstancia
            if (usuario && usuario.rol !== 'A') {
                router.push('/dashboard');
                return;
            }

            if (usuario && usuario.rol === 'A') {
                cargarMetricas();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuth, usuario, router]);

    const cargarMetricas = async () => {
        try {
            const res = await api.get('/reports/metricas');
            setMetricas(res.data.data);
        } catch (err) {
            setError('Error al cargar las métricas. ¿Estás seguro de que tenés permisos?');
        } finally {
            setCargando(false);
        }
    };

    if (cargando || !usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header modo oscuro para diferenciar que es zona Admin */}
            <header className="bg-gray-900 shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Volver al panel
                    </Link>
                    <span className="font-bold text-xl text-white tracking-tight">EASYLEAD Admin</span>
                </div>
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Sistema Operativo
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Métricas Globales</h1>
                    <p className="text-gray-500 mt-2">Visión general del rendimiento de la plataforma.</p>
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Usuarios Registrados</p>
                                {/* Extraemos totales numéricos de los almacenes D1 y D2 */}
                                <p className="text-4xl font-bold text-gray-900">{metricas?.usuarios_registrados || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className="bg-green-100 p-4 rounded-full text-green-600">
                                <Megaphone className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Campañas Creadas</p>
                                <p className="text-4xl font-bold text-gray-900">{metricas?.campanas_creadas || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
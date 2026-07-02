"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore'; // Asegurate de que la ruta coincida
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const res = await login(email, password);
        if (res.success) {
            router.push('/dashboard'); // Si sale bien, lo mandamos al panel
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="absolute top-6 left-6">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors bg-white/50 px-4 py-2 rounded-lg hover:bg-white shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver al inicio
                </Link>
            </div>
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Bienvenido de vuelta</h2>
                    <p className="text-gray-500 mt-2">Ingresá a tu cuenta de Easy Lead</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    ¿No tenés cuenta?{' '}
                    <Link href="/registro" className="text-blue-600 font-semibold hover:underline">
                        Registrate acá
                    </Link>
                </p>
            </div>
        </div>
    );
}
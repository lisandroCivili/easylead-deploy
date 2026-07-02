"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { jsPDF } from 'jspdf';
import { PlusCircle, Megaphone, LogOut, Loader2, Trash2, Edit2, X, FileJson, FileText } from 'lucide-react';

export default function DashboardPage() {
    const { usuario, logout, isAuth, checkAuth } = useAuthStore();
    const router = useRouter();
    
    const [campanas, setCampanas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados para la Edición
    const [editando, setEditando] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: '', objetivo: '', presupuesto: '', estado: '' });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuth) {
                router.push('/login');
            } else {
                cargarCampanas();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuth, router]);

    const cargarCampanas = async () => {
        try {
            setCargando(true);
            const res = await api.get('/campaigns');
            setCampanas(res.data);
        } catch (error) {
            console.error('Error al traer las campañas:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // --- EXPORTACIÓN DESDE EL DASHBOARD ---
    const exportarJSON = (camp) => {
        // Extraemos la metadata (o un objeto vacío si es una campaña vieja que no la tiene)
        const metadata = camp.camp_metadata || {};
        
        const dataExport = {
            id: camp.camp_id,
            negocio: camp.camp_nombre,
            objetivo: camp.camp_objetivo,
            presupuesto_diario: camp.camp_presupuesto,
            estado: camp.camp_estado === 'G' ? 'Guardada' : 'Borrador',
            alcance_estimado: metadata.presupuesto?.alcance_estimado || (Number(camp.camp_presupuesto) * 10),
            segmentacion: metadata.segmentacion || null,
            textos_publicitarios: metadata.textos_publicitarios || []
        };
        const dataStr = JSON.stringify(dataExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `easylead_campana_${camp.camp_nombre.replace(/\s+/g, '_').toLowerCase()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportarPDF = (camp) => {
        const doc = new jsPDF();
        const metadata = camp.camp_metadata || {};
        const alcance = metadata.presupuesto?.alcance_estimado || (Number(camp.camp_presupuesto) * 10);
        
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("Campaña Completa - EASYLEAD", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Campaña: ${camp.camp_nombre}`, 20, 40);
        doc.text(`Objetivo: ${camp.camp_objetivo}`, 20, 50);
        doc.text(`Presupuesto Diario: $${camp.camp_presupuesto}`, 20, 60);
        doc.setFont("helvetica", "bold");
        doc.text(`Alcance Estimado: ${alcance.toLocaleString("es-AR")} personas`, 20, 70);
        doc.setFont("helvetica", "normal");
        
        // Si la campaña tiene textos guardados (es decir, fue creada después de esta actualización)
        if (metadata.textos_publicitarios && metadata.textos_publicitarios.length > 0) {
            doc.setTextColor(37, 99, 235);
            doc.text("Textos Publicitarios:", 20, 95);
            doc.setTextColor(0, 0, 0);
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(metadata.textos_publicitarios[0].titulo, 20, 105);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const lineas = doc.splitTextToSize(metadata.textos_publicitarios[0].descripcion, 170);
            doc.text(lineas, 20, 115);

            doc.setFont("helvetica", "bold");
            // Calculamos donde poner el CTA según cuántas líneas ocupó la descripción (aprox 6 unidades por línea)
            const posicionCTA = 115 + (lineas.length * 6) + 10;
            doc.text(`Llamado a la acción (CTA): ${metadata.estructura.cta_recomendado}`, 20, posicionCTA);
        } else {
            // Mensaje para campañas viejas que no tenían la metadata
            doc.setTextColor(150, 150, 150);
            doc.text("* Esta es una campaña antigua guardada sin textos publicitarios.", 20, 100);
        }

        doc.save(`easylead_campana_${camp.camp_nombre.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };
    const eliminarCampana = async (id) => {
        if (window.confirm('¿Estás seguro de que querés borrar esta campaña?')) {
            try {
                await api.delete(`/campaigns/${id}`);
                setCampanas(campanas.filter(camp => camp.camp_id !== id));
            } catch (error) {
                console.error(error);
                alert('Error al eliminar la campaña. ¿Reiniciaste el backend?');
            }
        }
    };

    // --- FUNCIONES EDITAR ---
    const abrirEdicion = (camp) => {
        setEditando(camp.camp_id);
        setEditForm({
            nombre: camp.camp_nombre,
            objetivo: camp.camp_objetivo,
            presupuesto: camp.camp_presupuesto,
            estado: camp.camp_estado
        });
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/campaigns/${editando}`, editForm);
            // Actualizamos la tarjeta específica en la pantalla sin tener que recargar todo
            setCampanas(campanas.map(c => c.camp_id === editando ? res.data.campana : c));
            setEditando(null); // Cerramos el modal
        } catch (error) {
            console.error(error);
            alert('Error al actualizar la campaña.');
        }
    };

    if (!usuario || cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-900">EASYLEAD</h1>
                </div>
                <div className="flex items-center gap-4">
                    {usuario?.rol === 'A' && (
                        <Link 
                            href="/admin" 
                            className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Panel Admin
                        </Link>
                    )}
                    <span className="text-sm text-gray-600 font-medium">
                        Hola, {usuario.nombre}
                    </span>
                    <button 
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tus Campañas</h2>
                        <p className="text-gray-500 mt-1">Gestioná tu historial publicitario</p>
                    </div>
                    
                    <Link 
                        href="/generador" 
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Nueva Campaña
                    </Link>
                </div>

                {campanas.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No tenés campañas todavía</h3>
                        <p className="text-gray-500 mt-1 mb-6">Empezá a potenciar tu negocio creando tu primera estructura.</p>
                        <Link href="/generador" className="text-blue-600 font-semibold hover:underline">
                            Comenzá ahora &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campanas.map((camp) => (
                            <div key={camp.camp_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-gray-900 truncate pr-4" title={camp.camp_nombre}>
                                        {camp.camp_nombre}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${camp.camp_estado === 'G' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {camp.camp_estado === 'G' ? 'Guardada' : 'Borrador'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><span className="font-medium">Objetivo:</span> {camp.camp_objetivo}</p>
                                    <p><span className="font-medium">Presupuesto:</span> ${Number(camp.camp_presupuesto).toLocaleString('es-AR')}</p>
                                </div>
                                <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                                    {/* Grupo de Acciones */}
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => eliminarCampana(camp.camp_id)}
                                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium transition-colors"
                                            title="Eliminar campaña"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => abrirEdicion(camp)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition-colors"
                                            title="Editar campaña"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Grupo de Exportación */}
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => exportarJSON(camp)}
                                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-xs font-bold transition-colors bg-gray-100 px-2 py-1.5 rounded"
                                            title="Descargar Brief JSON"
                                        >
                                            <FileJson className="w-4 h-4" /> JSON
                                        </button>
                                        <button 
                                            onClick={() => exportarPDF(camp)}
                                            className="text-gray-600 hover:text-red-600 flex items-center gap-1 text-xs font-bold transition-colors bg-gray-100 px-2 py-1.5 rounded"
                                            title="Descargar Brief PDF"
                                        >
                                            <FileText className="w-4 h-4" /> PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- MODAL DE EDICIÓN --- */}
            {editando && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Editar Campaña</h3>
                            <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={guardarEdicion} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Negocio</label>
                                <input 
                                    type="text" 
                                    value={editForm.nombre} 
                                    onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                                <select 
                                    value={editForm.objetivo} 
                                    onChange={(e) => setEditForm({...editForm, objetivo: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="Más ventas">Más ventas</option>
                                    <option value="Más mensajes">Más mensajes</option>
                                    <option value="Reconocimiento">Reconocimiento</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Diario ($)</label>
                                <input 
                                    type="number" 
                                    value={editForm.presupuesto} 
                                    onChange={(e) => setEditForm({...editForm, presupuesto: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select 
                                    value={editForm.estado} 
                                    onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="B">Borrador</option>
                                    <option value="G">Guardada</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setEditando(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
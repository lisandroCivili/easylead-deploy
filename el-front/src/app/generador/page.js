"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { jsPDF } from "jspdf"; // Importamos la librería para el PDF

export default function GeneradorPage() {
  const router = useRouter();

  // Controlador de pasos del 1 al 4
  const [paso, setPaso] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [generando, setGenerando] = useState(false);

  // Almacenamos toda la data de la campaña en un solo objeto
  const [formData, setFormData] = useState({
    negocio: "",
    producto: "",
    objetivo: "Más ventas",
    edad: "",
    ubicacion: "",
    intereses: "",
    presupuestoDiario: "",
    dias: "",
  });

  // Manejador genérico para los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const siguientePaso = () => setPaso((prev) => prev + 1);
  const pasoAnterior = () => setPaso((prev) => prev - 1);

  const generarCampañaFinal = async () => {
    setGenerando(true);
    try {
      const res = await api.post("/generator/generar", formData);
      setResultado(res.data.data);
    } catch (error) {
      console.error(error);
      alert("Error al generar los textos. Probá de nuevo.");
    } finally {
      setGenerando(false);
    }
  };

  // --- EXPORTACIÓN JSON (Directo desde el frontend) ---
  const exportarJSON = () => {
    try {
      // Convertimos el resultado a texto JSON
      const dataStr = JSON.stringify(resultado, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      // Le ponemos el nombre del negocio al archivo limpiando espacios
      const nombreArchivo = formData.negocio.replace(/\s+/g, '_').toLowerCase();
      link.setAttribute("download", `easylead_${nombreArchivo}.json`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error al crear el archivo JSON.");
    }
  };

  // --- EXPORTACIÓN PDF (HU 3.2) ---
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      const nombreArchivo = formData.negocio.replace(/\s+/g, '_').toLowerCase();

      // Título
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // Azul Tailwind
      doc.text("Resumen de Campaña - EASYLEAD", 20, 20);

      // Datos Básicos
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Negocio: ${formData.negocio}`, 20, 40);
      doc.text(`Producto/Servicio: ${formData.producto}`, 20, 50);
      doc.text(`Objetivo: ${formData.objetivo}`, 20, 60);

      // Presupuesto y Alcance
      doc.text(`Presupuesto Diario: $${formData.presupuestoDiario}`, 20, 80);
      doc.text(`Duración: ${formData.dias} días`, 20, 90);
      doc.setFont("helvetica", "bold");
      doc.text(`Alcance Estimado: ${resultado.presupuesto.alcance_estimado.toLocaleString("es-AR")} personas`, 20, 100);
      doc.setFont("helvetica", "normal");

      // Textos Publicitarios
      doc.setTextColor(37, 99, 235);
      doc.text("Textos Publicitarios Generados:", 20, 120);
      doc.setTextColor(0, 0, 0);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(resultado.textos_publicitarios[0].titulo, 20, 130);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      // Rompe el texto largo en varias líneas para que no se salga de la hoja
      const lineasDescripcion = doc.splitTextToSize(resultado.textos_publicitarios[0].descripcion, 170);
      doc.text(lineasDescripcion, 20, 140);

      doc.setFont("helvetica", "bold");
      doc.text(`Llamado a la acción (CTA): ${resultado.estructura.cta_recomendado}`, 20, 160);

      // Descargar
      doc.save(`easylead_${nombreArchivo}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error al generar el PDF.");
    }
  };

  // --- RENDERIZADO DEL PASO 1 (HU 2.1) ---
  const renderPaso1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Datos de tu Negocio
        </h2>
        <p className="text-gray-500 mt-1">
          Contanos qué querés promocionar en EASYLEAD.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de tu Negocio
          </label>
          <input
            type="text"
            name="negocio"
            value={formData.negocio}
            onChange={handleChange}
            placeholder="Ej: Empanadas Don Carlos"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producto, servicio o promoción a publicitar
          </label>
          <input
            type="text"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            placeholder="Ej: Docena de empanadas de carne cortada a cuchillo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuál es tu objetivo?
          </label>
          <select
            name="objetivo"
            value={formData.objetivo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="Más ventas">Conseguir más ventas</option>
            <option value="Más mensajes">Recibir más mensajes</option>
            <option value="Reconocimiento">
              Que más gente conozca mi marca
            </option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={siguientePaso}
          disabled={!formData.negocio || !formData.producto}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- RENDERIZADO DEL PASO 2 (HU 2.2) ---
  const renderPaso2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Segmentación de Audiencia
        </h2>
        <p className="text-gray-500 mt-1">
          Definí a quién querés llegar con tu campaña en EASYLEAD.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de Edad
            </label>
            <select
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="18-24">18 - 24 años</option>
              <option value="25-45">25 - 45 años</option>
              <option value="45+">45+ años</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Tucumán"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intereses clave (separados por coma)
          </label>
          <input
            type="text"
            name="intereses"
            value={formData.intereses}
            onChange={handleChange}
            placeholder="Ej: Gastronomía, Delivery, Comida rápida"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={siguientePaso}
          disabled={!formData.edad || !formData.ubicacion || !formData.intereses}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- RENDERIZADO DEL PASO 3 (HU 2.3) ---
  const renderPaso3 = () => {
    const total =
      (Number(formData.presupuestoDiario) || 0) * (Number(formData.dias) || 0);
    const alcance = total * 10;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inversión y Alcance
          </h2>
          <p className="text-gray-500 mt-1">
            Configurá el presupuesto para tu campaña en EASYLEAD.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Diario ($)
            </label>
            <input
              type="number"
              name="presupuestoDiario"
              value={formData.presupuestoDiario}
              onChange={handleChange}
              placeholder="Ej: 5000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de duración
            </label>
            <input
              type="number"
              name="dias"
              value={formData.dias}
              onChange={handleChange}
              placeholder="Ej: 7"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-blue-700 font-medium">Inversión Total:</span>
            <span className="font-bold text-blue-900">
              ${total.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700 font-medium">Alcance Estimado:</span>
            <span className="font-bold text-blue-900">
              {alcance.toLocaleString("es-AR")} personas
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={siguientePaso}
            disabled={total <= 0}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            Siguiente <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // --- RENDERIZADO DEL PASO 4 (HU 3.1 y 3.2) ---
  const renderPaso4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vista Previa</h2>
        <p className="text-gray-500 mt-1">
          Tu campaña de EASYLEAD está lista para salir.
        </p>
      </div>

      {!resultado ? (
        <div className="text-center py-10">
          <button
            onClick={generarCampañaFinal}
            disabled={generando}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
          >
            {generando ? "Generando con IA..." : "Generar Campaña"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-blue-400 font-bold mb-2">
              Vista Previa del Anuncio
            </h3>
            <h4 className="text-xl font-bold mb-2">
              {resultado.textos_publicitarios[0].titulo}
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              {resultado.textos_publicitarios[0].descripcion}
            </p>
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">
              {resultado.estructura.cta_recomendado}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={async () => {
                try {
                  await api.post("/campaigns", {
                    nombre: formData.negocio,
                    objetivo: formData.objetivo,
                    presupuesto: formData.presupuestoDiario,
                    estado: "B",
                    metadata: resultado // <--- ACÁ LE PASAMOS TODOS LOS TEXTOS
                  });
                  router.push("/dashboard");
                } catch (error) {
                  alert("Error al guardar el borrador.");
                }
              }}
              className="bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Guardar Borrador
            </button>
            
            <button
              onClick={exportarJSON}
              className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Exportar JSON
            </button>

            <button
              onClick={exportarPDF}
              className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center border-b border-gray-200">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al panel
        </Link>
        <div className="mx-auto flex items-center gap-2">
          <span className="font-bold text-xl text-blue-600 tracking-tight">
            EASYLEAD
          </span>
        </div>
        <div className="w-24"></div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="mb-8 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300"
              style={{ width: `${((paso - 1) / 3) * 100}%` }}
            ></div>

            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  paso >= num
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {paso > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {paso === 1 && renderPaso1()}
            {paso === 2 && renderPaso2()}
            {paso === 3 && renderPaso3()}
            {paso === 4 && renderPaso4()}

            {paso > 1 && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <button
                  onClick={pasoAnterior}
                  className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Paso anterior
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
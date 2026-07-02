import Link from "next/link";
import { Megaphone, ArrowRight, Zap, Target, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar de la Landing */}
      <header className="bg-white px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-blue-600" />
          <span className="text-2xl font-black text-gray-900 tracking-tight">EASYLEAD</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 font-semibold hover:text-gray-900 px-4 py-2 transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/registro" className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          Campañas publicitarias <br />
          <span className="text-blue-600">sin complicaciones.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Diseñado para emprendedores. Generá la estructura, segmentación y textos de tus anuncios en Meta Ads de forma inteligente y en minutos.
        </p>
        <Link href="/registro" className="inline-flex items-center gap-2 bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg">
          Empezar a crear gratis <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Features / Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Copys Automáticos</h3>
            <p className="text-gray-500">Nuestro sistema redacta textos persuasivos basados en tu producto y objetivo en segundos.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Segmentación Ideal</h3>
            <p className="text-gray-500">Te sugerimos el público perfecto y calculamos el alcance estimado de tu inversión.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Exportación Rápida</h3>
            <p className="text-gray-500">Descargá tu campaña en PDF o JSON lista para ser implementada en tu cuenta publicitaria.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
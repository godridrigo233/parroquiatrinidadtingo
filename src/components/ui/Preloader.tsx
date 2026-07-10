import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Ahora el componente recibe si está cargando o no
export function Preloader({ isLoading }: { isLoading: boolean }) {
  // Controlamos cuándo destruirlo del DOM definitivamente
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Si ya dejó de cargar, esperamos 700ms (lo que dura la animación) para borrarlo
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Si ya terminó la animación, no renderizamos nada
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex md:hidden flex-col items-center justify-center text-white select-none transition-all duration-700 ease-in-out ${
        isLoading 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-8 pointer-events-none" // Animación de salida (se desvanece hacia arriba)
      }`}
    >
      {/* Fondo con gradiente radial (efecto foco de luz premium) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#140e72] to-[#0a0735]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_60%)]" />

      {/* Contenedor central */}
      <div className="relative z-10 flex flex-col items-center gap-7 text-center px-6">
        
        {/* Logo con animación de resplandor sutil */}
        <div className="relative h-24 w-24 md:h-28 md:w-28 animate-pulse duration-1000">
          <img 
            src="/assets/logo.webp" 
            alt="Logo Parroquia" 
            className="h-full w-full object-contain filter drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          />
        </div>

        {/* Textos con mayor espaciado (elegancia) */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-medium tracking-wider text-white drop-shadow-md">
            Santísima Trinidad
          </h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold/90 font-semibold">
            Parroquia · Tingo
          </p>
        </div>

        {/* Línea de carga moderna en lugar del spinner circular */}
        <div className="mt-6 w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
import { Loader2 } from "lucide-react";

export function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#140e72] text-white select-none animate-in fade-in duration-300">
      {/* Contenedor central */}
      <div className="flex flex-col items-center gap-6 text-center px-6">
        {/* Logo con animación de respiración/escala suave */}
        <div className="relative h-24 w-24 md:h-28 md:w-28 animate-pulse duration-1000">
          <img 
            src="/assets/logo.png" 
            alt="Logo Parroquia" 
            className="h-full w-full object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          />
        </div>

        {/* Textos de bienvenida */}
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-white">
            Santísima Trinidad
          </h2>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium">
            Parroquia · Tingo
          </p>
        </div>

        {/* Spinner de carga elegante en color oro */}
        <div className="mt-4">
          <Loader2 className="h-6 w-6 animate-spin text-gold opacity-90" />
        </div>
      </div>

      {/* Frase al pie de pantalla opcional */}
      <div className="absolute bottom-10 text-center opacity-40 text-xs tracking-wider">
        Arequipa, Perú
      </div>
    </div>
  );
}
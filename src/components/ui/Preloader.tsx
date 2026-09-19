import { useState, useEffect } from "react";

export function Preloader({ isLoading }: { isLoading: boolean }) {
  const [show, setShow] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Asegura un mínimo de tiempo para que la animación de entrada se aprecie con elegancia
  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 650);
    return () => clearTimeout(minTimer);
  }, []);

  const isActuallyFinished = !isLoading && minTimeElapsed;

  useEffect(() => {
    if (isActuallyFinished) {
      const timer = setTimeout(() => setShow(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isActuallyFinished]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white select-none transition-all duration-700 ease-out ${
        isActuallyFinished
          ? "opacity-0 -translate-y-6 blur-sm pointer-events-none scale-105"
          : "opacity-100 translate-y-0 blur-0 scale-100"
      }`}
    >
      {/* Fondo celestial profundo con destello dorado central */}
      <div className="absolute inset-0 bg-[#0c1226]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#141d3d] via-[#0c1226] to-[#070b18]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_65%)]" />

      {/* Contenedor central */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-sm mx-auto">
        
        {/* Logo circular con halo dorado pulsante */}
        <div className="relative h-28 w-28 sm:h-32 sm:w-32">
          {/* Anillo de luz exterior giratorio */}
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold/50 animate-spin [animation-duration:1.6s]" />
          
          {/* Halo pulsante detrás del logo */}
          <span className="absolute -inset-2 rounded-full bg-gold/25 blur-2xl animate-pulse [animation-duration:1.8s]" />
          
          {/* Logo recortado en círculo con sombra premium */}
          <div className="absolute inset-[6px] rounded-full overflow-hidden ring-2 ring-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.45)] bg-[#0c1226]">
            <img
              src="/assets/logo.webp"
              alt="Logo Parroquia Santísima Trinidad"
              width={128}
              height={128}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Textos de bienvenida con tipografía solemne */}
        <div className="space-y-1.5 mt-1">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-gold font-bold">
            Comunidad de Fe
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-white drop-shadow-md">
            Parroquia Santísima Trinidad
          </h2>
          <p className="text-xs text-white/70 italic font-display mt-1">
            «Paz y Bien a quienes entran a esta casa de Dios»
          </p>
        </div>

        {/* Barra de carga dorada fina */}
        <div className="mt-3 w-28 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

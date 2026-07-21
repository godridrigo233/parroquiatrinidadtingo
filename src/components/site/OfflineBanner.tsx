import { useState, useEffect } from "react";
import { WifiOff, ShieldCheck } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOffline(!window.navigator.onLine);

    // Escuchar cambios de red en tiempo real
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:max-w-md md:left-auto md:right-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1e2a5e]/95 text-white border-2 border-gold/60 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0 border border-gold/30">
          <WifiOff size={20} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1">
            <ShieldCheck size={13} /> Modo sin conexión
          </p>
          <p className="text-sm font-medium text-white/90 leading-tight mt-0.5">
            Estás dentro del templo o sin señal. Puedes seguir leyendo las oraciones y horarios guardados.
          </p>
        </div>
      </div>
    </div>
  );
}
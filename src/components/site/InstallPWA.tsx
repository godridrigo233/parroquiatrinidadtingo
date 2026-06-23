import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previene que el navegador muestre su propio mini-aviso automático
      e.preventDefault();
      // Guardamos el evento para dispararlo cuando el usuario haga clic en nuestro botón
      setDeferredPrompt(e);
      // Mostramos nuestro banner elegante
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Dispara el prompt nativo de instalación de Android/iOS/Chrome
    deferredPrompt.prompt();
    
    // Espera a que el usuario acepte o rechace
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false); // Ocultamos el banner si aceptó
    }
    
    // Limpiamos el evento
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-primary text-primary-foreground rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-4 z-[100] flex gap-4 items-start animate-in slide-in-from-bottom-5 border border-white/10">
      <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
        <Download size={24} className="text-gold" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base">App Parroquial</h3>
        <p className="text-xs text-primary-foreground/80 mt-1 leading-relaxed">
          Instala la aplicación para tener los horarios, avisos y eventos siempre a la mano. No consume espacio.
        </p>
        
        <div className="mt-4 flex gap-3">
          <button 
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-gold text-primary font-bold text-xs py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            Instalar ahora
          </button>
        </div>
      </div>

      <button 
        onClick={() => setIsVisible(false)} 
        className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors shrink-0"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
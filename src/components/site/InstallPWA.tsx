import { useState, useEffect } from "react";
// 👇 Asegúrate de importar 'Share' para el modal de iPhone
import { Download, MoreVertical, PlusSquare, X, Smartphone, Share } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         ('standalone' in window.navigator && (window.navigator as any).standalone);

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
    }

    if (isAndroidDevice && !isStandalone) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("App instalada con éxito");
      }
      setDeferredPrompt(null);
      return;
    }

    setShowAndroidInstructions(true);
  };

  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-[#1e2a5e] text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-md text-sm active:scale-95"
      >
        <Download size={16} />
        Instalar App
      </button>

      {/* 🤖 MODAL PARA ANDROID */}
      {showAndroidInstructions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="bg-card text-card-foreground p-6 rounded-2xl max-w-sm w-full shadow-elegant relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAndroidInstructions(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-primary mb-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                <Smartphone size={22} />
              </div>
              <h3 className="text-lg font-display font-semibold">Instalar en Android</h3>
            </div>
            
            <p className="mb-5 text-xs text-muted-foreground leading-relaxed">
              Tu navegador está procesando la instalación. Si la descarga nativa no inicia automáticamente, sigue estos sencillos pasos:
            </p>
            
            <ol className="flex flex-col gap-4 text-left text-sm text-foreground">
              <li className="flex items-center gap-4 bg-secondary/40 p-3 rounded-xl border border-border">
                <span className="bg-background p-2 rounded-lg shadow-sm border border-border">
                  <MoreVertical size={18} className="text-foreground" />
                </span>
                <span className="text-xs">1. Presiona el botón de los <strong>tres puntos (⋮)</strong> en la esquina superior de Chrome.</span>
              </li>
              <li className="flex items-center gap-4 bg-secondary/40 p-3 rounded-xl border border-border">
                <span className="bg-background p-2 rounded-lg shadow-sm border border-border">
                  <PlusSquare size={18} className="text-gold" />
                </span>
                <span className="text-xs">2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</span>
              </li>
            </ol>
            
            <button 
              onClick={() => setShowAndroidInstructions(false)}
              className="w-full mt-6 bg-gradient-gold text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* 🍏 VENTANA EMERGENTE PARA IPHONE */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="bg-card text-card-foreground p-6 rounded-2xl max-w-sm w-full shadow-elegant relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-primary mb-3">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-700">
                <Smartphone size={22} />
              </div>
              <h3 className="text-lg font-display font-semibold">Instalar en iPhone</h3>
            </div>

            <p className="mb-5 text-xs text-muted-foreground leading-relaxed">
              Para instalar la app de la Parroquia en tu dispositivo Apple, sigue estos dos pasos desde Safari:
            </p>
            
            {/* 👇 INSTRUCCIONES DE IPHONE RESTAURADAS CON DISEÑO MODERNO */}
            <ol className="flex flex-col gap-4 text-left text-sm text-foreground">
              <li className="flex items-center gap-4 bg-secondary/40 p-3 rounded-xl border border-border">
                <span className="bg-background p-2 rounded-lg shadow-sm border border-border">
                  <Share size={18} className="text-blue-500" />
                </span>
                <span className="text-xs">1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-center gap-4 bg-secondary/40 p-3 rounded-xl border border-border">
                <span className="bg-background p-2 rounded-lg shadow-sm border border-border">
                  <PlusSquare size={18} className="text-foreground" />
                </span>
                <span className="text-xs">2. Selecciona <strong>"Agregar a inicio"</strong>.</span>
              </li>
            </ol>

            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-secondary text-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
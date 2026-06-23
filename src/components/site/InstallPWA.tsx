import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  // Nuevos estados para manejar iPhone/iPad
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Detectar si el usuario está en un dispositivo Apple (iOS)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // 2. Detectar si la app ya está instalada (para no mostrar el botón)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         ('standalone' in window.navigator && (window.navigator as any).standalone);

    // Si es un iPhone y NO está instalada, activamos el modo iOS
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
    }

    // 3. Lógica normal para Android y Computadoras
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
    // Si es iPhone, mostramos la ventana de instrucciones
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // Si es Android/PC, hacemos la instalación automática
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("App instalada con éxito");
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Si no es instalable en Android y tampoco es iOS, ocultamos el botón
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-[#140e72] text-white px-4 py-2 rounded-full font-medium hover:bg-blue-900 transition-colors shadow-md text-sm"
      >
        <Download size={18} />
        Instalar App
      </button>

      {/* VENTANA EMERGENTE SOLO PARA IPHONE */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold mb-2 text-[#140e72]">Instalar en iPhone</h3>
            <p className="mb-5 text-sm text-gray-600 leading-relaxed">
              Para instalar la app de la Parroquia en tu dispositivo, sigue estos dos sencillos pasos:
            </p>
            
            <ol className="flex flex-col gap-4 text-left text-sm font-medium text-gray-700">
              <li className="flex items-center gap-4">
                <span className="bg-gray-100 p-2.5 rounded-lg shadow-sm border border-gray-200">
                  <Share size={20} className="text-blue-500" />
                </span>
                <span>1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="bg-gray-100 p-2.5 rounded-lg shadow-sm border border-gray-200">
                  <PlusSquare size={20} className="text-gray-700" />
                </span>
                <span>2. Selecciona <strong>"Agregar a inicio"</strong>.</span>
              </li>
            </ol>
            
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
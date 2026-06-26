import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  // Nuevos estados para manejar iPhone/iPad
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

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

  // Si el evento nativo está listo, lanzamos la instalación limpia
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") console.log("App instalada");
    setDeferredPrompt(null);
    setIsInstallable(false);
  } else {
    // 👇 Si Chrome retuvo el evento, le enseñamos al usuario cómo instalarlo manualmente
    alert("Para instalar la aplicación en Android:\n\n1. Toca los 3 puntos (⋮) de la esquina superior derecha de Chrome.\n2. Selecciona 'Instalar aplicación' o 'Agregar a la pantalla de inicio'.");
  }
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
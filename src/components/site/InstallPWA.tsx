import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function InstallPWA() {
  // Guardamos el evento nativo del navegador
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  // Controlamos si el botón debe verse o no
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Evitamos que Chrome muestre su propio mini-aviso automático
      e.preventDefault();
      // Guardamos el evento para dispararlo luego con el botón
      setDeferredPrompt(e);
      // Mostramos nuestro botón personalizado
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Limpieza del evento
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 1. Mostramos la ventana nativa de instalación
    deferredPrompt.prompt();

    // 2. Esperamos a ver qué elige el usuario (Instalar o Cancelar)
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("App instalada con éxito");
    }

    // 3. Limpiamos todo porque el evento solo se puede usar una vez
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Si la app ya está instalada o el navegador no lo soporta (ej. iOS), ocultamos el botón
  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 bg-[#140e72] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-md"
    >
      <Download size={20} />
      Instalar App
    </button>
  );
}
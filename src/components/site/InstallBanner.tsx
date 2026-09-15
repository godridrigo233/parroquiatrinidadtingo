import { useState, useEffect } from "react";
import { X, Share, PlusSquare, MoreVertical, Download, Church } from "lucide-react";

const DISMISS_KEY = "pwa-banner-dismissed-until";
const DISMISS_DAYS = 10; // no volver a mostrar por 10 días tras cerrar

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [visible, setVisible] = useState(false); // para animación de entrada

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Ya instalada como PWA (standalone) → no mostrar ──
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // ── Sólo en móviles / tablets ──
    const ua = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|iphone|ipad|ipod|mobile/.test(ua) ||
      (window.innerWidth < 1024 && "ontouchstart" in window);
    if (!isMobile) return;

    // ── Verificar si fue descartado recientemente ──
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    // Android / Chrome: esperar evento beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      triggerBanner();
    };

    if (!isIOSDevice) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    } else {
      // iOS: mostrar después de 4 segundos si no fue descartado
      const timer = setTimeout(triggerBanner, 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  function triggerBanner() {
    setShow(true);
    // Pequeño delay para que la animación de slide-up funcione
    requestAnimationFrame(() => setTimeout(() => setVisible(true), 50));
  }

  function dismiss() {
    setVisible(false);
    setTimeout(() => setShow(false), 350);
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
  }

  async function handleInstall() {
    if (isIOS) {
      setShowSteps(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    } else {
      setShowSteps(true);
    }
  }

  if (!show) return null;

  return (
    <>
      {/* ── Banner flotante inferior ── */}
      <div
        role="banner"
        aria-label="Instalar aplicación parroquial"
        className={`fixed bottom-0 left-0 right-0 z-[90] transition-transform duration-350 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Fondo con cristal */}
        <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-[#0f1b2d]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Barra decorativa dorada */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

          <div className="flex items-center gap-3.5 px-4 py-3.5">
            {/* Ícono de la parroquia */}
            <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-[#c9a84c]/30 to-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center">
              <img
                src="/assets/logo.webp"
                alt="Logo Parroquia"
                className="h-8 w-8 rounded-lg object-cover"
              />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">
                Parroquia Trinidad Tingo
              </p>
              <p className="text-white/55 text-[11px] leading-snug mt-0.5">
                Guárdala en tu celular · acceso directo
              </p>
            </div>

            {/* Botón instalar */}
            <button
              type="button"
              onClick={handleInstall}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#c9a84c] text-[#0f1b2d] text-xs font-bold shadow-md hover:bg-[#d4b660] active:scale-95 transition-all"
            >
              <Download size={13} strokeWidth={2.5} />
              Instalar
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="flex-shrink-0 p-1.5 rounded-full text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de instrucciones (iOS o Android manual) ── */}
      {showSteps && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-6">
          <div className="bg-card text-card-foreground w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Encabezado */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Church size={18} className="text-gold" />
                <h3 className="font-display font-semibold text-base">
                  {isIOS ? "Instalar en iPhone / iPad" : "Instalar en Android"}
                </h3>
              </div>
              <button
                onClick={() => setShowSteps(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pasos */}
            <ol className="flex flex-col gap-3 p-5">
              {isIOS ? (
                <>
                  <li className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
                      <Share size={16} className="text-blue-500" />
                    </span>
                    <span className="text-sm leading-snug">
                      Toca el botón <strong>Compartir</strong>{" "}
                      <span className="text-muted-foreground">(la cajita con la flecha)</span> en Safari.
                    </span>
                  </li>
                  <li className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
                      <PlusSquare size={16} className="text-foreground" />
                    </span>
                    <span className="text-sm leading-snug">
                      Desplázate y selecciona <strong>"Agregar a inicio"</strong>.
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
                      <MoreVertical size={16} className="text-foreground" />
                    </span>
                    <span className="text-sm leading-snug">
                      Toca los <strong>tres puntos (⋮)</strong> en la esquina de Chrome.
                    </span>
                  </li>
                  <li className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
                      <PlusSquare size={16} className="text-gold" />
                    </span>
                    <span className="text-sm leading-snug">
                      Selecciona <strong>"Instalar aplicación"</strong> o{" "}
                      <strong>"Agregar a pantalla de inicio"</strong>.
                    </span>
                  </li>
                </>
              )}
            </ol>

            <div className="px-5 pb-5">
              <button
                onClick={() => { setShowSteps(false); dismiss(); }}
                className="w-full bg-gradient-to-r from-[#c9a84c] to-[#d4b660] text-[#0f1b2d] font-bold py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

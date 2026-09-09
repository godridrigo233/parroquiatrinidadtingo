import { useState, useEffect, useRef, useCallback } from "react";
import { BellRing, Check, RefreshCw, BellOff, Smartphone, Share, PlusSquare, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_VAPID_KEY = "BJLswLik8W3GnuH3ddJS-gtGv5FVRhwvpBY9XniCBtvQbXRtCgWpxB8mUScpvabh087Wb0BIVaF9RQfXiPMMilI";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [mode, setMode] = useState<"checking" | "subscribe" | "subscribed">("checking");
  const [working, setWorking] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Detectar entorno e instalación ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 1024;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobileDevice(isMobileUA || (isSmallScreen && hasTouch));

    const mq = window.matchMedia("(display-mode: standalone)");
    const checkStandalone = () =>
      setIsStandalone(mq.matches || (window.navigator as any).standalone === true);
    checkStandalone();
    mq.addEventListener("change", checkStandalone);

    return () => mq.removeEventListener("change", checkStandalone);
  }, []);

  // ── Verificar si ya hay suscripción activa ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
          if (!cancelled) setMode("subscribe");
          return;
        }

        if (Notification.permission !== "granted") {
          if (!cancelled) setMode("subscribe");
          return;
        }

        let reg = await navigator.serviceWorker.getRegistration();

        if (reg && (!reg.active || reg.active.state === "redundant")) {
          await reg.unregister();
          reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }

        if (!reg) {
          if (!cancelled) setMode("subscribe");
          return;
        }

        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
          if (!cancelled) setMode("subscribe");
          return;
        }

        const subJson = sub.toJSON();

        // Asegurar que esté sincronizado con Supabase
        await (supabase as any)
          .from("push_subscriptions")
          .upsert({ endpoint: subJson.endpoint, keys: subJson.keys }, { onConflict: "endpoint" });

        if (!cancelled) setMode("subscribed");
      } catch (err) {
        console.warn("[Push] Error verificando suscripción:", err);
        if (!cancelled) setMode("subscribe");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isStandalone]);

  // ── Handler de suscripción ──
  const handleSubscribe = useCallback(async () => {
    // Si es un iPhone/iPad y NO está en pantalla de inicio (PWA), guiar al usuario
    if (isIOS && !isStandalone) {
      setShowIOSModal(true);
      return;
    }

    setWorking(true);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Tu navegador o versión actual no soporta notificaciones push.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso denegado. Puedes activarlo en los ajustes de tu navegador.");
        return;
      }

      // Registrar Service Worker
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.active || reg.active.state === "redundant") {
        if (reg) await reg.unregister();
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }

      // Esperar a que el SW esté activo
      await new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          navigator.serviceWorker.getRegistration().then((r) => {
            if (r?.active?.state === "activated") resolve();
            else if (Date.now() - start > 10000)
              reject(new Error("El Service Worker tardó demasiado en iniciar."));
            else setTimeout(check, 250);
          }).catch(reject);
        };
        check();
      });

      // Obtener o crear suscripción push
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
      }

      // Guardar en Supabase
      const subJson = subscription.toJSON();
      const { error: dbError } = await (supabase as any)
        .from("push_subscriptions")
        .upsert({ endpoint: subJson.endpoint, keys: subJson.keys }, { onConflict: "endpoint" });

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Mostrar notificación de prueba inmediata en el dispositivo
      try {
        reg.showNotification("⛪ ¡Recordatorios de Misa activados!", {
          body: "Te avisaremos 30 minutos antes de cada Misa dominical (7:30 AM y 5:30 PM). ¡Paz y bien!",
          icon: "/assets/logo.webp",
          badge: "/assets/logo.webp",
          tag: "bienvenida-misa",
          data: { url: "/#horarios" },
        });
      } catch (notifErr) {
        console.warn("No se pudo disparar la notificación local de prueba:", notifErr);
      }

      if (isMounted.current) {
        setMode("subscribed");
        toast.success("¡Avisos de Misa activados! Recibirás la notificación en tu celular.", {
          duration: 4500,
          position: "top-center",
        });
      }
    } catch (err: any) {
      console.error("[Push Error]:", err);
      if (isMounted.current) {
        toast.error(err.message || "No se pudo activar las notificaciones.", {
          duration: 5000,
          position: "top-center",
        });
      }
    } finally {
      if (isMounted.current) setWorking(false);
    }
  }, [isIOS, isStandalone]);

  // ── Handler de desuscripción ──
  const handleUnsubscribe = useCallback(async () => {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const subJson = sub.toJSON();
          await sub.unsubscribe();
          await (supabase as any)
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subJson.endpoint!);
        }
      }
      if (isMounted.current) {
        setMode("subscribe");
        toast.success("Recordatorios de Misa desactivados.", { position: "top-center" });
      }
    } catch {
      if (isMounted.current) toast.error("No se pudo desactivar.");
    } finally {
      if (isMounted.current) setWorking(false);
    }
  }, []);

  if (!isMobileDevice) {
    return null;
  }

  return (
    <>
      {/* ── Estado: Verificando ── */}
      {mode === "checking" && (
        <div className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary/50 text-muted-foreground text-xs select-none">
          <RefreshCw size={13} className="animate-spin mr-2" />
          <span>Verificando avisos...</span>
        </div>
      )}

      {/* ── Estado: Suscrito ── */}
      {mode === "subscribed" && (
        <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold select-none shadow-sm">
          <span className="flex items-center gap-1.5 text-left">
            <Check size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Avisos de Misa activos</span>
          </span>
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={working}
            className="text-[11px] underline opacity-75 hover:opacity-100 flex items-center gap-1 font-normal disabled:opacity-50 ml-2"
          >
            {working ? <RefreshCw size={11} className="animate-spin" /> : <BellOff size={11} />}
            Desactivar
          </button>
        </div>
      )}

      {/* ── Estado: No suscrito (Botón de activar) ── */}
      {mode === "subscribe" && (
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={working}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-primary font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer select-none"
        >
          <BellRing size={15} className={working ? "animate-pulse" : "animate-bounce"} />
          <span>{working ? "Conectando..." : "Activar Avisos de Misa"}</span>
        </button>
      )}

      {/* ── Modal instructivo para iPhone / iPad ── */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="bg-card text-card-foreground p-6 rounded-2xl max-w-sm w-full shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-primary mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-xl text-blue-700 dark:text-blue-300">
                <Smartphone size={22} />
              </div>
              <h3 className="text-lg font-display font-semibold">Avisos en iPhone / iPad</h3>
            </div>

            <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
              Apple requiere que agregues la web a tu pantalla de inicio para recibir avisos de Misa en tu iPhone o iPad:
            </p>

            <ol className="flex flex-col gap-3 text-left text-xs text-foreground">
              <li className="flex items-center gap-3 bg-secondary/40 p-2.5 rounded-xl border border-border">
                <span className="bg-background p-1.5 rounded-lg shadow-sm border border-border">
                  <Share size={16} className="text-blue-500" />
                </span>
                <span>1. Toca el botón <strong>Compartir</strong> en la barra de Safari.</span>
              </li>
              <li className="flex items-center gap-3 bg-secondary/40 p-2.5 rounded-xl border border-border">
                <span className="bg-background p-1.5 rounded-lg shadow-sm border border-border">
                  <PlusSquare size={16} className="text-gold" />
                </span>
                <span>2. Selecciona <strong>"Agregar a inicio"</strong>.</span>
              </li>
              <li className="flex items-center gap-3 bg-secondary/40 p-2.5 rounded-xl border border-border">
                <span className="bg-background p-1.5 rounded-lg shadow-sm border border-border">
                  <BellRing size={16} className="text-emerald-500" />
                </span>
                <span>3. Abre la app desde tu pantalla de inicio y toca <strong>"Activar Avisos"</strong>.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 bg-gradient-gold text-primary font-bold py-2.5 rounded-xl text-xs sm:text-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}


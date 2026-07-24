import { useState, useEffect } from "react";
import { BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (isMounted) setIsSubscribed(true);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration("/");
        if (reg && reg.pushManager) {
          const sub = await reg.pushManager.getSubscription();
          if (isMounted) setIsSubscribed(!!sub);
        } else {
          if (isMounted) setIsSubscribed(false);
        }
      } catch (err) {
        if (isMounted) setIsSubscribed(false);
      }
    }

    checkSubscription();
    return () => { isMounted = false; };
  }, []);

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Tu celular no soporta alertas. En iPhone recuerda agregar primero la web a tu Pantalla de Inicio.");
      return;
    }

    setLoading(true);

    try {
      // 1. PRIMERO PEDIMOS PERMISO (Sin reloj corriendo)
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permiso denegado. Puedes activarlo en Configuración > Notificaciones.");
        setLoading(false);
        return;
      }

      // 2. TEMPORIZADOR DE SEGURIDAD (15 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("El sistema tardó en conectar con Apple APNs. Inténtalo nuevamente.")), 15000)
      );

      const pushTask = async () => {
        // Registramos explícitamente el Service Worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // 🔥 EL TRUCO PARA iOS: Si el Service Worker está instalando o esperando, lo obligamos a activarse
        if (!reg.active) {
          const worker = reg.installing || reg.waiting;
          if (worker) {
            await new Promise<void>((resolve) => {
              if (worker.state === "activated") {
                resolve();
              } else {
                worker.addEventListener("statechange", (e: any) => {
                  if (e.target.state === "activated") resolve();
                });
              }
            });
          } else {
            // Si no atrapó el worker, esperamos el evento oficial .ready
            await navigator.serviceWorker.ready;
          }
        }

        // En iOS, necesitamos asegurar que reg.active exista para llamar a pushManager
        const activeReg = reg.active || (await navigator.serviceWorker.ready);
        if (!activeReg || !activeReg.pushManager) {
          throw new Error("El motor de notificaciones no logró activarse en iOS.");
        }

        // Suscribimos el dispositivo generando el token VAPID
        const subscription = await activeReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });

        const subJson = subscription.toJSON();

        // Guardamos en Supabase
        const { error } = await supabase.from("push_subscriptions").insert({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        });

        if (error && !error.message.includes("duplicate")) {
          throw new Error(`Error en base de datos: ${error.message}`);
        }

        return true;
      };

      await Promise.race([pushTask(), timeoutPromise]);

      setIsSubscribed(true);
      alert("¡Listo! Ahora recibirás los avisos importantes de la parroquia en tu pantalla.");
    } catch (error: any) {
      console.error("Error al suscribirse:", error);
      alert(`No se pudo activar: ${error.message || "Error de conexión"}`);
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed === null || isSubscribed === true) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={subscribeToPush}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-gold text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
    >
      <BellRing size={15} className="animate-bounce text-primary-foreground" />
      <span>{loading ? "Conectando con el celular..." : "🔔 Activar Avisos en el Celular"}</span>
    </button>
  );
}
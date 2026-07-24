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
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        });
      }).catch(() => {
        // Si sw.js falla o no existe, mostramos el botón de todas formas
        setIsSubscribed(false);
      });
    } else {
      setIsSubscribed(true); // Ocultamos si el navegador no soporta push
    }
  }, []);

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Tu navegador actual no soporta notificaciones push. Si usas iPhone, asegúrate de añadir la web a tu pantalla de inicio.");
      return;
    }

    setLoading(true);

    try {
      // 1. BLINDAJE: Temporizador de 10 segundos para evitar que se quede "cargando..." por siempre
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("El sistema tardó demasiado. Verifica tu conexión o que el archivo /sw.js exista en el servidor.")), 10000)
      );

      // 2. TAREA PRINCIPAL: Registrar y obtener permiso
      const pushTask = async () => {
        // Forzamos el registro para capturar errores 404 si falta el archivo
        const reg = await navigator.serviceWorker.register("/sw.js");
        const registration = await navigator.serviceWorker.ready;
        
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Has denegado o bloqueado el permiso de notificaciones en tu celular.");
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });

        const subJson = subscription.toJSON();

        const { error } = await supabase.from("push_subscriptions").insert({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        });

        if (error && !error.message.includes("duplicate")) throw error;
        return true;
      };

      // Ejecutamos una carrera: el que termine primero (la suscripción o el temporizador de 10 seg)
      await Promise.race([pushTask(), timeoutPromise]);

      setIsSubscribed(true);
      alert("¡Listo! Ya estás suscrito para recibir los avisos parroquiales.");
    } catch (error: any) {
      console.error("Error al suscribirse:", error);
      alert(`No se pudo activar: ${error.message || "Error desconocido"}`);
    } finally {
      // Esto GARANTIZA que el botón jamás se quede pegado en "Activando..."
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
      <span>{loading ? "Activando... (Esperando permiso)" : "🔔 Activar Avisos en el Celular"}</span>
    </button>
  );
}
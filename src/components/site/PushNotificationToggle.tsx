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

    async function preWarmAndCheck() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (isMounted) setIsSubscribed(true); // Ocultar si no hay soporte
        return;
      }

      try {
        // 🔥 PRE-CALENTAMIENTO: Registramos el SW en silencio apenas se abre la app
        // Esto garantiza que cuando el usuario toque el botón, el motor YA ESTÉ ACTIVO en iOS
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        
        // Esperamos a que esté listo en segundo plano sin congelar la interfaz
        const readyReg = await navigator.serviceWorker.ready;

        if (readyReg && readyReg.pushManager) {
          const sub = await readyReg.pushManager.getSubscription();
          if (isMounted) setIsSubscribed(!!sub);
        } else {
          if (isMounted) setIsSubscribed(false);
        }
      } catch (err) {
        console.warn("Error en pre-calentamiento de SW:", err);
        if (isMounted) setIsSubscribed(false);
      }
    }

    preWarmAndCheck();
    return () => { isMounted = false; };
  }, []);

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Tu dispositivo no soporta alertas. En iPhone asegúrate de agregar la web a tu Pantalla de Inicio.");
      return;
    }

    setLoading(true);

    try {
      // 1. Pedimos permiso nativo primero (Sin tiempo límite)
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permiso denegado. Para activarlo, ve a Configuración > Notificaciones en tu iPhone y permite los avisos para esta app.");
        setLoading(false);
        return;
      }

      // 2. TEMPORIZADOR DE SEGURIDAD (15 Segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("La red tardó en conectar con Apple APNs. Verifica tu internet e inténtalo de nuevo.")), 15000)
      );

      // 3. DISPARO DIRECTO A APNs (Como el SW ya se pre-calentó, esto es instantáneo)
      const pushTask = async () => {
        // Tomamos el Service Worker que ya está listo y esperando
        const readyReg = await navigator.serviceWorker.ready;

        if (!readyReg || !readyReg.pushManager) {
          throw new Error("El sistema de notificaciones de iOS no está disponible.");
        }

        // Suscribimos directamente a los servidores de Apple/Google
        const subscription = await readyReg.pushManager.subscribe({
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

      // Corremos la suscripción en paralelo con el reloj de 15 segundos
      await Promise.race([pushTask(), timeoutPromise]);

      setIsSubscribed(true);
      alert("¡Listo! Ahora recibirás los avisos importantes de la parroquia en tu pantalla.");
    } catch (error: any) {
      console.error("Error al suscribirse:", error);
      alert(`No se pudo activar: ${error.message || "Error de conexión con la nube"}`);
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
      <span>{loading ? "Conectando con los servidores..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}
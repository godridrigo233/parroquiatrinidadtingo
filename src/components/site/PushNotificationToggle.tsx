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
      alert("Tu celular actual no soporta este tipo de alertas. Si usas iPhone, asegúrate de agregar primero la web a tu Pantalla de Inicio.");
      return;
    }

    setLoading(true);

    try {
      // 1. PRIMERO PEDIMOS PERMISO (SIN TIEMPO LÍMITE)
      // Así el feligrés puede leer la alerta del celular el tiempo que necesite sin que el código falle
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permiso denegado. Para activarlo después, ve a la configuración de tu navegador y permite las notificaciones para este sitio.");
        setLoading(false);
        return;
      }

      // 2. UNA VEZ CONCEDIDO EL PERMISO, INICIAMOS LA CONEXIÓN TÉCNICA (Con seguro de 15 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("La red tardó en conectar con Google/Apple. Verifica tu internet e inténtalo de nuevo.")), 15000)
      );

      const pushTask = async () => {
        // Registramos o actualizamos el Service Worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // En móviles, a veces reg.pushManager está disponible de inmediato en el registro
        // Si no, esperamos al Service Worker activo
        let pushManager = reg.pushManager;
        if (!pushManager) {
          const activeReg = await navigator.serviceWorker.ready;
          pushManager = activeReg.pushManager;
        }

        // Suscribimos el dispositivo generando el token VAPID
        const subscription = await pushManager.subscribe({
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
      <span>{loading ? "Conectando con el celular..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}
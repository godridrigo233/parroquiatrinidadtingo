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
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // null mientras carga
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true); // Ya está suscrito
          } else {
            setIsSubscribed(false); // No está suscrito, hay que mostrar el botón
          }
        });
      });
    } else {
      setIsSubscribed(true); // Si no lo soporta el navegador, lo ocultamos para que no rompa la UI
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Has denegado los permisos de notificación en tu navegador.");
        setLoading(false);
        return;
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

      setIsSubscribed(true); // Esto hará que el botón desaparezca automáticamente al instante
      alert("¡Listo! Ya estás suscrito para recibir los avisos parroquiales.");
    } catch (error: any) {
      console.error("Error al suscribirse:", error);
      alert("No se pudo activar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  // Si todavía está revisando el navegador o el usuario YA ESTÁ SUSCRITO, no mostramos nada (desaparece)
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
      <span>{loading ? "Activando..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}
import { useState } from "react";
import { BellRing, Check, RefreshCw } from "lucide-react";
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribeToPush = async () => {
    // 1. Validación estricta para iOS y navegadores compatibles
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Tu navegador o dispositivo no soporta notificaciones push. En iPhone, asegúrate de haber instalado la PWA en tu Pantalla de Inicio.");
      return;
    }

    setLoading(true);

    try {
      // 2. Pedimos el permiso nativo al usuario
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permiso denegado. Para activarlo en tu iPhone, ve a Configuración > Notificaciones y permite las alertas para esta app.");
        setLoading(false);
        return;
      }

      // 3. Seguro de tiempo límite (15 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("La red tardó en conectar con los servidores. Verifica tu conexión.")), 15000)
      );

      // 4. Registro y suscripción directa
      const pushTask = async () => {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const readyReg = await navigator.serviceWorker.ready;

        if (!readyReg || !readyReg.pushManager) {
          throw new Error("El sistema de notificaciones no está disponible en este dispositivo.");
        }

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

  // Si ya se suscribió en esta sesión, mostramos el estado activo
  if (isSubscribed) {
    return (
      <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold select-none">
        <span className="flex items-center gap-1.5"><Check size={14} /> Avisos activos</span>
        <button 
          type="button"
          onClick={() => setIsSubscribed(false)} 
          className="text-[11px] underline opacity-80 hover:opacity-100 flex items-center gap-1 font-normal"
        >
          <RefreshCw size={11} /> Reiniciar
        </button>
      </div>
    );
  }

  // El botón aparece instantáneamente sin quedarse colgado en "Verificando..."
  return (
    <button
      type="button"
      onClick={subscribeToPush}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-gold text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
    >
      <BellRing size={15} className="animate-bounce text-primary-foreground" />
      <span>{loading ? "Conectando..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}
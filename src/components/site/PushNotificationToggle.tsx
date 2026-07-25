import { useState, useEffect, useRef } from "react";
import { BellRing, Check, RefreshCw, BellOff } from "lucide-react";
import { toast } from "sonner";
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

function timeout<T>(ms: number, msg: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
}

export function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpiar el failsafe al desmontar
  useEffect(() => {
    return () => {
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
    };
  }, []);

  // ── Al montar: verificar si ya hay suscripción activa ──
  useEffect(() => {
    let cancelled = false;
    async function checkExistingSubscription() {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          if (!cancelled) setIsChecking(false);
          return;
        }

        const permission = Notification.permission;
        if (permission !== "granted") {
          if (!cancelled) setIsChecking(false);
          return;
        }

        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg || !reg.pushManager) {
          if (!cancelled) setIsChecking(false);
          return;
        }

        const subscription = await reg.pushManager.getSubscription();
        if (!subscription) {
          if (!cancelled) setIsChecking(false);
          return;
        }

        // Verificar que la suscripción sigue en la BD
        const subJson = subscription.toJSON();
        const { data, error } = await (supabase as any)
          .from("push_subscriptions")
          .select("id")
          .eq("endpoint", subJson.endpoint)
          .maybeSingle();

        if (!error && data) {
          if (!cancelled) setIsSubscribed(true);
        }
      } catch {
        // Silencioso: si falla, mostramos el botón de activar
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    checkExistingSubscription();
    return () => { cancelled = true; };
  }, []);

  // ── Detectar si la PWA está instalada en iOS para habilitar push ──
  const isPWAStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
     (window.navigator as any).standalone === true);

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Tu navegador no soporta notificaciones push.", { duration: 5000 });
      return;
    }

    // ───── FAILSAFE ABSOLUTO: si en 20s no terminó, fuerza reset de UI ─────
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    let stepToastId: string | number | undefined;

    failsafeRef.current = setTimeout(() => {
      setLoading(false);
      if (stepToastId) toast.dismiss(stepToastId);
      toast.error("El proceso tardó demasiado. Reinicia la app y vuelve a intentarlo.", { duration: 6000 });
    }, 20_000);

    setLoading(true);

    try {
      // ── Paso 1: Permiso de notificaciones (con timeout) ──
      stepToastId = toast.loading("Solicitando permiso de notificaciones...");
      const permission = await Promise.race([
        Notification.requestPermission(),
        timeout(10_000, "No se recibió respuesta del sistema de permisos."),
      ]);
      if (permission !== "granted") {
        toast.dismiss(stepToastId);
        toast.error("Permiso denegado. Actívalo en Configuración > Notificaciones.", { duration: 5000 });
        return;
      }
      toast.dismiss(stepToastId);

      // ── Paso 2: Registrar y activar el Service Worker ──
      stepToastId = toast.loading("Activando servicio de notificaciones...");
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      toast.dismiss(stepToastId);

      // ── Paso 3: Suscripción al sistema de push del navegador ──
      stepToastId = toast.loading("Registrando dispositivo...");
      let subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        const subJson = subscription.toJSON();
        const { data } = await Promise.race([
          (supabase as any).from("push_subscriptions").select("id").eq("endpoint", subJson.endpoint).maybeSingle(),
          timeout(10_000, "Error de conexión con el servidor."),
        ]);

        if (data) {
          toast.dismiss(stepToastId);
          setIsSubscribed(true);
          toast.success("Ya estabas suscrito a los avisos parroquiales.");
          return;
        }

        await Promise.race([
          (supabase as any).from("push_subscriptions").upsert(
            { endpoint: subJson.endpoint, keys: subJson.keys },
            { onConflict: "endpoint" }
          ),
          timeout(10_000, "Error de conexión con el servidor."),
        ]);
      } else {
        subscription = await Promise.race([
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
          }),
          timeout(15_000, "El servicio de notificaciones del dispositivo no respondió."),
        ]);

        const subJson = subscription.toJSON();
        await Promise.race([
          (supabase as any).from("push_subscriptions").upsert(
            { endpoint: subJson.endpoint, keys: subJson.keys },
            { onConflict: "endpoint" }
          ),
          timeout(10_000, "Error al guardar en el servidor."),
        ]);
      }

      toast.dismiss(stepToastId);
      setIsSubscribed(true);
      toast.success("¡Listo! Recibirás los avisos de la parroquia en tu celular.", { duration: 4000 });
    } catch (error: any) {
      if (stepToastId) toast.dismiss(stepToastId);
      console.error("[Push] Error:", error);
      toast.error(error.message || "No se pudo activar. Verifica tu conexión y vuelve a intentar.", { duration: 6000 });
    } finally {
      if (failsafeRef.current) { clearTimeout(failsafeRef.current); failsafeRef.current = null; }
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          const subJson = subscription.toJSON();
          await subscription.unsubscribe();
          await Promise.race([
            (supabase as any).from("push_subscriptions").delete().eq("endpoint", subJson.endpoint),
            timeout(8000, "Error al eliminar del servidor."),
          ]);
        }
      }
      setIsSubscribed(false);
      toast.success("Avisos desactivados. No recibirás más notificaciones.", { duration: 4000 });
    } catch (error: any) {
      toast.error(error.message || "No se pudo desactivar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Solo se muestra si la PWA está instalada ──
  if (!isPWAStandalone) return null;

  // ── Verificando estado al montar ──
  if (isChecking) {
    return (
      <div className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary/50 text-muted-foreground text-xs select-none">
        <RefreshCw size={13} className="animate-spin mr-2" />
        Verificando avisos...
      </div>
    );
  }

  // ── Ya suscrito: estado activo ──
  if (isSubscribed) {
    return (
      <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold select-none">
        <span className="flex items-center gap-1.5"><Check size={14} /> Avisos activos</span>
        <button
          type="button"
          onClick={unsubscribeFromPush}
          disabled={loading}
          className="text-[11px] underline opacity-80 hover:opacity-100 flex items-center gap-1 font-normal disabled:opacity-50"
        >
          {loading ? <RefreshCw size={11} className="animate-spin" /> : <BellOff size={11} />}
          Desactivar
        </button>
      </div>
    );
  }

  // ── Botón de activación ──
  return (
    <button
      type="button"
      onClick={subscribeToPush}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-gold text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
    >
      <BellRing size={15} className={loading ? "animate-pulse" : "animate-bounce"} />
      <span>{loading ? "Conectando..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}

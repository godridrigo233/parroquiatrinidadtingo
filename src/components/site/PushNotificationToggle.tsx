import { useState, useEffect, useRef, useCallback } from "react";
import { BellRing, Check, RefreshCw, BellOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Detectar si la PWA está instalada ──
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const check = () => setIsStandalone(mq.matches || (window.navigator as any).standalone === true);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  // ── Verificar si ya hay suscripción activa ──
  useEffect(() => {
    if (!isStandalone) return;

    let cancelled = false;
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
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
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
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

        // upsert: si existe lo ignora, si no existe lo inserta
        const { error } = await (supabase as any)
          .from("push_subscriptions")
          .upsert({ endpoint: subJson.endpoint, keys: subJson.keys }, { onConflict: "endpoint" });

        if (error) {
          console.error("[Push] Error upsert:", error);
          if (!cancelled) setMode("subscribe");
          return;
        }

        if (!cancelled) setMode("subscribed");
      } catch (err) {
        console.error("[Push] Error verificando:", err);
        if (!cancelled) setMode("subscribe");
      }
    })();

    return () => { cancelled = true; };
  }, [isStandalone]);

  // ── Handler de suscripción ──
  const handleSubscribe = useCallback(async () => {
    setWorking(true);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Tu navegador no soporta notificaciones push.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso denegado. Activa las notificaciones en la configuración de tu navegador.");
        return;
      }

      // Registrar/revivir SW
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.active || reg.active.state === "redundant") {
        if (reg) await reg.unregister();
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {}
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }

      await new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          navigator.serviceWorker.getRegistration().then((r) => {
            if (r?.active?.state === "activated") resolve();
            else if (Date.now() - start > 10000) reject(new Error("El Service Worker no se activó a tiempo. Recarga la app."));
            else setTimeout(check, 300);
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

      // Guardar en BD con upsert
      const subJson = subscription.toJSON();
      const { error: dbError } = await (supabase as any)
        .from("push_subscriptions")
        .upsert({ endpoint: subJson.endpoint, keys: subJson.keys }, { onConflict: "endpoint" });

      if (dbError) {
        alert("❌ Error: " + (dbError.message || "No se pudo guardar."));
        throw new Error(dbError.message);
      }

      if (isMounted.current) {
        setMode("subscribed");
        toast.success("¡Listo! Recibirás avisos de la parroquia en tu celular.", {
          duration: 4000,
          position: "top-center",
        });
        alert("✅ ¡Avisos activados!\n\nRecibirás las notificaciones de la parroquia.");
      }
    } catch (err: any) {
      console.error("[Push] Error:", err);
      if (isMounted.current) {
        toast.error(err.message || "No se pudo activar.", { duration: 5000, position: "top-center" });
      }
    } finally {
      if (isMounted.current) setWorking(false);
    }
  }, []);

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
          await (supabase as any).from("push_subscriptions").delete().eq("endpoint", subJson.endpoint!);
        }
      }
      if (isMounted.current) {
        setMode("subscribe");
        toast.success("Avisos desactivados.", { position: "top-center" });
      }
    } catch {
      if (isMounted.current) toast.error("No se pudo desactivar.");
    } finally {
      if (isMounted.current) setWorking(false);
    }
  }, []);

  // ── BLINDAJE: solo PWA instalada ──
  if (!isStandalone) return null;

  // ── Verificando ──
  if (mode === "checking") {
    return (
      <div className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl bg-secondary/50 text-muted-foreground text-xs select-none">
        <RefreshCw size={13} className="animate-spin mr-2" />
        Verificando avisos...
      </div>
    );
  }

  // ── Suscrito ──
  if (mode === "subscribed") {
    return (
      <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold select-none">
        <span className="flex items-center gap-1.5"><Check size={14} /> Avisos activos</span>
        <button
          type="button"
          onClick={handleUnsubscribe}
          disabled={working}
          className="text-[11px] underline opacity-80 hover:opacity-100 flex items-center gap-1 font-normal disabled:opacity-50"
        >
          {working ? <RefreshCw size={11} className="animate-spin" /> : <BellOff size={11} />}
          Desactivar
        </button>
      </div>
    );
  }

  // ── Botón de activar ──
  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={working}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-gold text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
    >
      <BellRing size={15} className={working ? "animate-pulse" : "animate-bounce"} />
      <span>{working ? "Conectando..." : "Activar Avisos en el Celular"}</span>
    </button>
  );
}

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
    const check = () => {
      const standalone = mq.matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      console.log("[Push] PWA instalada?", standalone, "| display-mode:", mq.matches, "| navigator.standalone:", (window.navigator as any).standalone);
    };
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
        console.log("[Push] Verificando suscripción existente...");

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          console.log("[Push] Sin soporte para Push.");
          if (!cancelled) setMode("subscribe");
          return;
        }

        if (Notification.permission !== "granted") {
          console.log("[Push] Permiso no concedido aún.");
          if (!cancelled) setMode("subscribe");
          return;
        }

        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          console.log("[Push] Sin registro SW previo.");
          if (!cancelled) setMode("subscribe");
          return;
        }

        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
          console.log("[Push] Sin suscripción push previa.");
          if (!cancelled) setMode("subscribe");
          return;
        }

        const subJson = sub.toJSON();
        const { data } = await (supabase as any)
          .from("push_subscriptions")
          .select("id")
          .eq("endpoint", subJson.endpoint!)
          .maybeSingle();

        if (data) {
          console.log("[Push] Suscripción confirmada en BD:", subJson.endpoint?.slice(0, 50));
          if (!cancelled) setMode("subscribed");
        } else {
          console.log("[Push] Suscripción local existe pero no en BD.");
          if (!cancelled) setMode("subscribe");
        }
      } catch (err) {
        console.error("[Push] Error verificando:", err);
        if (!cancelled) setMode("subscribe");
      }
    })();

    return () => { cancelled = true; };
  }, [isStandalone]);

  // ── Handler de suscripción ──
  const handleSubscribe = useCallback(async () => {
    console.log("[Push] Iniciando proceso de suscripción...");
    setWorking(true);

    try {
      // 1. Verificar capacidad
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Tu navegador no soporta notificaciones push.");
        console.log("[Push] ❌ Sin soporte.");
        return;
      }
      console.log("[Push] ✓ Navegador compatible.");

      // 2. Pedir permiso
      console.log("[Push] Solicitando permiso de notificación...");
      const permission = await Notification.requestPermission();
      console.log("[Push] Permiso:", permission);

      if (permission !== "granted") {
        toast.error("Permiso denegado. Para recibir avisos, activa las notificaciones en la configuración de tu navegador.");
        return;
      }
      console.log("[Push] ✓ Permiso concedido.");

      // 3. Registrar Service Worker
      console.log("[Push] Registrando Service Worker...");
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        console.log("[Push] SW registrado.");
      } else {
        console.log("[Push] SW ya registrado, estado:", reg.active?.state);
      }

      // Esperar que el SW esté controlando la página
      if (!reg.active || reg.active.state !== "activated") {
        console.log("[Push] Esperando activación del SW...");
        await new Promise<void>((resolve, reject) => {
          const start = Date.now();
          const check = () => {
            // Volver a consultar el registro más reciente
            navigator.serviceWorker.getRegistration().then((freshReg) => {
              if (freshReg?.active && freshReg.active.state === "activated") {
                console.log("[Push] ✓ SW activado.");
                resolve();
              } else if (Date.now() - start > 8000) {
                reject(new Error("El Service Worker no se activó a tiempo."));
              } else {
                setTimeout(check, 200);
              }
            }).catch(reject);
          };
          check();
        });
      } else {
        console.log("[Push] ✓ SW ya activo.");
      }

      // 4. Obtener suscripción push
      console.log("[Push] Verificando suscripción push existente...");
      let subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        console.log("[Push] Suscripción push ya existe:", subscription.endpoint.slice(0, 60));
        // Si ya existe, desuscribir primero para obtener una nueva
        await subscription.unsubscribe();
        console.log("[Push] Desuscrita anterior.");
      }

      console.log("[Push] Creando nueva suscripción push...");
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });
      console.log("[Push] ✓ Nueva suscripción creada:", subscription.endpoint.slice(0, 60));

      // 5. Guardar en Supabase
      const subJson = subscription.toJSON();
      console.log("[Push] Guardando en BD...");

      const { error: dbError } = await (supabase as any)
        .from("push_subscriptions")
        .upsert(
          { endpoint: subJson.endpoint, keys: subJson.keys },
          { onConflict: "endpoint" }
        );

      if (dbError) {
        console.error("[Push] Error BD:", dbError);
        throw new Error("Error al guardar la suscripción.");
      }

      console.log("[Push] ✓ Suscripción guardada en BD.");
      console.log("[Push] ✅ PROCESO COMPLETO — notificaciones activadas.");

      if (isMounted.current) {
        setMode("subscribed");
        toast.success("¡Listo! Recibirás avisos importantes de la parroquia en tu celular.", {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (err: any) {
      console.error("[Push] ❌ Error:", err);
      if (isMounted.current) {
        toast.error(err.message || "No se pudo activar. Intenta de nuevo.", {
          duration: 5000,
          position: "top-center",
        });
      }
    } finally {
      console.log("[Push] Fin del proceso.");
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
          await (supabase as any)
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subJson.endpoint!);
          console.log("[Push] Desuscrito.");
        }
      }
      if (isMounted.current) {
        setMode("subscribe");
        toast.success("Avisos desactivados.", { position: "top-center" });
      }
    } catch (err: any) {
      if (isMounted.current) toast.error("No se pudo desactivar.");
    } finally {
      if (isMounted.current) setWorking(false);
    }
  }, []);

  // ── BLINDAJE: no mostrar absolutamente nada si no hay PWA instalada ──
  if (!isStandalone) {
    return null;
  }

  // ── Verificando estado ──
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

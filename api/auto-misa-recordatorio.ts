import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: Request) {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Validar autorización (Vercel Cron Header o Bearer Token de GitHub Actions)
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const authHeader = req.headers.get("authorization") || "";
    const expectedSecret = process.env.CRON_SECRET;

    const isAuthorized =
      isVercelCron ||
      (expectedSecret && authHeader === `Bearer ${expectedSecret}`) ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "No autorizado." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const privateKey = process.env.PRIVATE_VAPID_KEY;
    const publicKey =
      process.env.PUBLIC_VAPID_KEY ||
      process.env.VITE_PUBLIC_VAPID_KEY ||
      "BJLswLik8W3GnuH3ddJS-gtGv5FVRhwvpBY9XniCBtvQbXRtCgWpxB8mUScpvabh087Wb0BIVaF9RQfXiPMMilI";

    if (!privateKey || !publicKey) {
      return new Response(JSON.stringify({ error: "Configuración VAPID incompleta en el servidor." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails("mailto:pstrinidadtingo@gmail.com", publicKey, privateKey);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Faltan variables de Supabase." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { data: suscriptores, error: dbError } = await sb.from("push_subscriptions").select("*");

    if (dbError) {
      throw new Error(`Error BD: ${dbError.message}`);
    }

    if (!suscriptores || suscriptores.length === 0) {
      return new Response(JSON.stringify({ message: "No hay suscriptores registrados aún." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determinar si es misa de mañana (8:00 AM) o tarde (6:00 PM) en hora de Perú (UTC-5)
    const currentUtcHour = new Date().getUTCHours();
    const esManana = currentUtcHour < 17; // antes de las 17 UTC (12:00 PM Perú)
    const misaHora = esManana ? "8:00 AM" : "6:00 PM";

    const payload = JSON.stringify({
      title: `⛪ ¡La Santa Misa comienza a las ${misaHora}!`,
      body: `Iniciamos la celebración en 30 minutos en el templo parroquial de Tingo. ¡Te esperamos en familia! 🙏`,
      url: "/#horarios",
      icon: "/assets/logo.webp",
      badge: "/assets/logo.webp",
    });

    let enviados = 0;
    let eliminados = 0;

    await Promise.allSettled(
      suscriptores.map(async (sub: any) => {
        try {
          if (!sub.endpoint || !sub.keys) return;
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          enviados++;
        } catch (err: any) {
          console.warn("[Push Cron] Error enviando a endpoint:", err.statusCode, err.message);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await sb.from("push_subscriptions").delete().eq("id", sub.id);
            eliminados++;
          }
        }
      })
    );

    console.log(`[Cron Misa ${misaHora}] Enviados: ${enviados}, Eliminados: ${eliminados}`);

    return new Response(
      JSON.stringify({
        success: true,
        misaHora,
        enviados,
        eliminados,
        total: suscriptores.length,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Cron Misa Error]:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

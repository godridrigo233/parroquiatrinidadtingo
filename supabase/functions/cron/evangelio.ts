import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as webPush from "web-push";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Usamos exactamente los nombres de variables que tienes en Vercel según tu foto
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const vapidPublic = process.env.PUBLIC_VAPID_KEY;
  const vapidPrivate = process.env.PRIVATE_VAPID_KEY;

  if (!supabaseUrl || !supabaseKey || !vapidPublic || !vapidPrivate) {
    console.error("Error: Faltan credenciales en las variables de entorno de Vercel.");
    return res.status(500).json({ error: "Configuración incompleta en el servidor" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    webPush.setVapidDetails(
      "mailto:pstrinidadtingo@gmail.com",
      vapidPublic,
      vapidPrivate
    );

    const payload = JSON.stringify({
      title: "📖 Evangelio del Día",
      body: "Inicia tu mañana con la Palabra de Dios y la bendición parroquial. Toca para leer las lecturas.",
      url: "https://www.vaticannews.va/es/evangelio-de-hoy.html",
    });

    // Llamamos a la función RPC segura para obtener los dispositivos
    const { data: suscripciones, error } = await supabase.rpc("obtener_y_limpiar_suscripciones");

    if (error) throw error;
    if (!suscripciones || suscripciones.length === 0) {
      return res.status(200).json({ message: "Sin suscriptores activos" });
    }

    const invalidEndpoints: string[] = [];

    const promesas = suscripciones.map((sub: any) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      ).catch((err: any) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          invalidEndpoints.push(sub.endpoint);
        }
      })
    );

    await Promise.all(promesas);

    // Limpieza secundaria si corresponde
    if (invalidEndpoints.length > 0) {
      await supabase.rpc("obtener_y_limpiar_suscripciones", { tokens_invalidos: invalidEndpoints });
    }

    return res.status(200).json({ success: true, enviados: suscripciones.length });
  } catch (error: any) {
    console.error("Error en cron de Evangelio:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
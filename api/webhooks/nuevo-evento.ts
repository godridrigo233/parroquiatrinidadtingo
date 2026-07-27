import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push"; // 👈 Volvemos a la importación limpia por defecto

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const vapidPublic = process.env.PUBLIC_VAPID_KEY;
  const vapidPrivate = process.env.PRIVATE_VAPID_KEY;

  if (!vapidPublic || !vapidPrivate || !supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Configuración incompleta en el servidor" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Si por alguna razón el empaquetador de Vercel lo anida en una propiedad default, la extraemos dinámicamente
    const wp = (webPush as any).default || webPush;

    wp.setVapidDetails(
      "mailto:pstrinidadtingo@gmail.com",
      vapidPublic,
      vapidPrivate
    );

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed - Solo POST" });
    }

    const nuevoEvento = req.body.record;
    if (!nuevoEvento) {
      return res.status(400).json({ error: "No se recibió el registro del evento desde Supabase" });
    }

    const payload = JSON.stringify({
      title: `🎉 ¡Nuevo Evento: ${nuevoEvento.title || "Aviso Parroquial"}!`,
      body: nuevoEvento.description || "Toca aquí para ver la fecha y todos los detalles.",
      url: "/#noticias",
    });

    const { data: suscripciones, error: dbError } = await supabase.rpc("obtener_y_limpiar_suscripciones");
    if (dbError) throw dbError;

    if (!suscripciones || suscripciones.length === 0) {
      return res.status(200).json({ message: "No hay suscriptores activos para notificar" });
    }

    const invalidEndpoints: string[] = [];
    const promesas = suscripciones.map((sub: any) =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      ).catch((err: any) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          invalidEndpoints.push(sub.endpoint);
        }
      })
    );

    await Promise.all(promesas);

    if (invalidEndpoints.length > 0) {
      await supabase.rpc("obtener_y_limpiar_suscripciones", { tokens_invalidos: invalidEndpoints });
    }

    return res.status(200).json({ success: true, notificados: suscripciones.length });
  } catch (error: any) {
    console.error("Error interno en el Webhook:", error);
    return res.status(500).json({ error: error.message || "Error interno", stack: error.stack });
  }
}
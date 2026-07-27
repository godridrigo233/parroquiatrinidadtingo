import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as webPush from "web-push";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Tomamos las URLs y Llaves usando exactamente los nombres de tu Vercel
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const vapidPublic = process.env.PUBLIC_VAPID_KEY;
  const vapidPrivate = process.env.PRIVATE_VAPID_KEY;

  // 2. Validación clara de entorno
  if (!vapidPublic || !vapidPrivate) {
    console.error("Error fatal: Faltan PUBLIC_VAPID_KEY o PRIVATE_VAPID_KEY.");
    return res.status(500).json({ error: "Faltan llaves VAPID en Vercel" });
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error fatal: No se encontró la URL o Llave PUBLISHABLE de Supabase.");
    return res.status(500).json({ error: "Faltan credenciales de Supabase (PUBLISHABLE_KEY) en Vercel" });
  }

  try {
    // 3. Inicializamos los clientes
    const supabase = createClient(supabaseUrl, supabaseKey);

    webPush.setVapidDetails(
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

    if (invalidEndpoints.length > 0) {
      await supabase.rpc("obtener_y_limpiar_suscripciones", { tokens_invalidos: invalidEndpoints });
    }

    return res.status(200).json({ success: true, notificados: suscripciones.length });
  } catch (error: any) {
    console.error("Error interno en el Webhook:", error);
    return res.status(500).json({ error: error.message || "Error interno", stack: error.stack });
  }
}
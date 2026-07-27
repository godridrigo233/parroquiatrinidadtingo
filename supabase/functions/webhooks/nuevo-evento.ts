import type { VercelRequest, VercelResponse } from "@vercel/node";
import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Inicialización con las credenciales estándar que ya tienes
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

webPush.setVapidDetails(
  "mailto:pstrinidadtingo@gmail.com",
  process.env.PUBLIC_VAPID_KEY!,
  process.env.PRIVATE_VAPID_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const nuevoEvento = req.body.record;
    if (!nuevoEvento) {
      return res.status(400).json({ error: "No se recibió el registro del evento" });
    }

    const payload = JSON.stringify({
      title: `🎉 ¡Nuevo Evento: ${nuevoEvento.title || "Aviso Parroquial"}!`,
      body: nuevoEvento.description || "Toca aquí para ver la fecha y todos los detalles.",
      url: "/#noticias",
    });

    // Llamamos a la función RPC segura para obtener los dispositivos
    const { data: suscripciones, error } = await supabase.rpc("obtener_y_limpiar_suscripciones");

    if (error) throw error;
    if (!suscripciones || suscripciones.length === 0) {
      return res.status(200).json({ message: "No hay suscriptores activos" });
    }

    const invalidEndpoints: string[] = [];

    const promesas = suscripciones.map((sub: any) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      ).catch((err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          invalidEndpoints.push(sub.endpoint);
        }
      })
    );

    await Promise.all(promesas);

    // Limpieza secundaria en lote si se detectaron tokens obsoletos
    if (invalidEndpoints.length > 0) {
      await supabase.rpc("obtener_y_limpiar_suscripciones", { tokens_invalidos: invalidEndpoints });
    }

    return res.status(200).json({ success: true, notificados: suscripciones.length });
  } catch (error: any) {
    console.error("Error en webhook de evento:", error);
    return res.status(500).json({ error: error.message });
  }
}
// Archivo: supabase/functions/enviar-push-masivo/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

webpush.setVapidDetails(
  "mailto:pstrinidadtingo@gmail.com",
  Deno.env.get("PUBLIC_VAPID_KEY")!,
  Deno.env.get("PRIVATE_VAPID_KEY")!
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Manejo de CORS para el navegador
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, body, url } = await req.json();

    if (!body) {
      return new Response(JSON.stringify({ error: "El cuerpo del mensaje es obligatorio." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Obtenemos todas las suscripciones de los celulares guardados
    const { data: suscriptores, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) throw error;

    if (!suscriptores || suscriptores.length === 0) {
      return new Response(JSON.stringify({ message: "No hay celulares suscritos aún." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Empaquetamos el mensaje que leerá el Service Worker (sw.js)
    const payload = JSON.stringify({
      title: title || "Parroquia Santísima Trinidad",
      body: body,
      url: url || "/#noticias",
      icon: "/assets/logo.webp"
    });

    let enviados = 0;
    let eliminados = 0;

    // 3. Disparamos a cada celular en paralelo
    const promesas = suscriptores.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys,
        }, payload);
        enviados++;
      } catch (err: any) {
        // Si el celular ya desinstaló la PWA (Error 404 o 410), borramos el registro viejo para limpiar la base de datos
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          eliminados++;
        }
      }
    });

    await Promise.all(promesas);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Aviso enviado a ${enviados} dispositivos (${eliminados} registros caducados fueron limpiados).`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
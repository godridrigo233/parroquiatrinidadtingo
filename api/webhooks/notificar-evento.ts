import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const makeWebhookUrl = process.env.MAKE_EVENT_WEBHOOK_URL;

  if (!accessToken || !supabaseUrl || !supabaseKey || !makeWebhookUrl) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({ error: "Sesión inválida" });
    }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!role || !["admin", "editor", "secretaria"].includes(role.role)) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }

    const { title, event_date, location, description, image_url } = req.body || {};
    if (typeof title !== "string" || !title.trim() || title.length > 160) {
      return res.status(400).json({ error: "Datos del evento inválidos" });
    }

    const response = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        event_date: typeof event_date === "string" ? event_date.slice(0, 40) : null,
        location: typeof location === "string" ? location.slice(0, 160) : null,
        description: typeof description === "string" ? description.slice(0, 500) : null,
        image_url: typeof image_url === "string" ? image_url.slice(0, 500) : null,
      }),
    });

    if (!response.ok) {
      console.error("Make rechazó la notificación:", response.status);
      return res.status(502).json({ error: "No se pudo enviar la notificación" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error notificando evento:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
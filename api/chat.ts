import { createClient } from "@supabase/supabase-js";
import { createGroq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const PARISH_STATIC_DATA = `
== IDENTIDAD ==
Nombre: Parroquia Santísima Trinidad de Tingo
Dirección: Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado, Arequipa, Perú
Teléfono (solo llamadas): +51 915 049 850
Email: pstrinidadtingo@gmail.com
Facebook: https://www.facebook.com/parroquiasantisimatrinidadtingo/
Instagram: https://www.instagram.com/stma_trinidad_tingo/
Canal WhatsApp: https://whatsapp.com/channel/0029Vb8tmDx90x2wWaZDB71a
Congregación: Carmelitas de María Inmaculada (CMI)
Patrona: Nuestra Señora de los Dolores

== SACRAMENTO: MATRIMONIO ==
Anticipación mínima: 3 meses | Atención: Lun–Sáb 3:00–6:00 PM | Tel: +51 915 049 850
Requisitos:
1. Partida de Bautismo original actualizada (de ambos)
2. Constancia de Confirmación (de ambos)
3. Partida de Nacimiento (de ambos)
4. Partida de Matrimonio Civil
5. Certificado de charla prematrimonial
6. 2 testigos no familiares directos
7. DNI de novios y testigos
8. Fotos carné de ambos novios
9. Padrinos casados por la Iglesia
10. Completar 2 entrevistas con el sacerdote
`;

// Variables de entorno limpias para Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

// Rate Limit Map Temporal en memoria Serverless
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string, limit = 6, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);

  return record.count <= limit;
}

// Obtener datos dinámicos de Supabase
async function buildParishContext() {
  if (!supabaseUrl || !supabaseKey) return "";
  try {
    const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const today = new Date().toISOString().split("T")[0];

    const [{ data: schedules }, { data: events }] = await Promise.all([
      sb.from("schedules").select("category, day_label, time_label, notes").order("sort_order"),
      sb.from("events").select("title, description, event_date, location").gte("event_date", today).order("event_date").limit(10),
    ]);

    let ctx = "";
    if (schedules && schedules.length > 0) {
      ctx += "\n\n== HORARIOS ACTUALIZADOS ==\n";
      schedules.forEach(s => {
        ctx += `- ${s.day_label}: ${s.time_label} (${s.notes || s.category})\n`;
      });
    }

    if (events && events.length > 0) {
      ctx += "\n\n== PRÓXIMOS EVENTOS ==\n";
      events.forEach(e => {
        const fecha = new Date(e.event_date).toLocaleDateString("es-PE");
        ctx += `- ${e.title} | ${fecha} | Lugar: ${e.location}\n`;
      });
    }

    return ctx;
  } catch (err) {
    console.error("Error fetching context:", err);
    return "";
  }
}

// Track Analytics
async function trackQueryAnalytics(userQuery: string) {
  if (!supabaseUrl || !supabaseKey) return;
  try {
    const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const cleanQuery = userQuery.toLowerCase();
    let category = "general";

    if (/misa|horario|domingo/i.test(cleanQuery)) category = "misas";
    else if (/bautismo|matrimonio|confesi/i.test(cleanQuery)) category = "sacramentos";
    else if (/direccion|llegar/i.test(cleanQuery)) category = "ubicacion";

    await sb.from("analytics_queries").insert({
      query_text: userQuery.slice(0, 250),
      category: category,
    });
  } catch (err) {
    console.error("Analytics warning:", err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Rate Limiting
  const rawIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const clientIp = rawIp.split(",")[0].trim();

  if (!checkRateLimit(clientIp, 6, 60000)) {
    return res.status(429).json({ error: "Has enviado demasiados mensajes seguidos. Por favor, espera un minuto." });
  }

  try {
    if (!groqApiKey) {
      throw new Error("Falta GROQ_API_KEY en Vercel.");
    }

    const { messages: rawMessages } = req.body;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return res.status(400).json({ error: "Formato de mensajes inválido" });
    }

    // Limpieza de mensajes
    const safeMessages = rawMessages.slice(-10).map((m: any) => ({
      role: m.role,
      content: m.content || (Array.isArray(m.parts) ? m.parts[0]?.text : ""),
    })).filter((m: any) => m.content);

    const lastUserMsg = safeMessages.filter((m: any) => m.role === "user").pop();
    const userQueryText = lastUserMsg?.content || "";

    const [dynamicContext] = await Promise.all([
      buildParishContext(),
      userQueryText ? trackQueryAnalytics(userQueryText) : Promise.resolve(),
    ]);

    const groq = createGroq({ apiKey: groqApiKey });
    
    // Llamada con Vercel AI SDK compatible con streams
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Eres el Hermano Elías, el asistente oficial de la Parroquia Santísima Trinidad de Tingo... \n\n ${PARISH_STATIC_DATA} \n ${dynamicContext}`,
      messages: safeMessages,
      maxOutputTokens: 350,
    });

    // Devuelve el stream directo al cliente de React
    return result.pipeTextStreamToResponse(res);
  } catch (err: any) {
    console.error("Chat backend error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
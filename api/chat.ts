import { createClient } from "@supabase/supabase-js";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const config = {
  runtime: "edge",
};

const PARISH_STATIC_DATA = `
== IDENTIDAD ==
Nombre: Parroquia Santísima Trinidad de Tingo
Dirección: Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado, Arequipa, Perú
Teléfono (solo llamadas): +51 915 049 850
Email: pstrinidadtingo@gmail.com
`;

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  try {
    if (!groqApiKey) {
      throw new Error("Falta GROQ_API_KEY en Vercel.");
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Formato inválido" }), { status: 400 });
    }

    const safeMessages = messages.slice(-10).map((m: any) => ({
      role: m.role,
      content: m.content || (Array.isArray(m.parts) ? m.parts[0]?.text : ""),
    })).filter((m: any) => m.content);

    let dynamicContext = "";
    try {
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const today = new Date().toISOString().split("T")[0];
        const { data: events } = await sb
          .from("events")
          .select("title, event_date, location")
          .gte("event_date", today)
          .order("event_date")
          .limit(3);

        if (events && events.length > 0) {
          dynamicContext += "\n\n== PRÓXIMOS EVENTOS ==\n";
          events.forEach(e => {
            const fecha = new Date(e.event_date).toLocaleDateString("es-PE");
            dynamicContext += `- ${e.title} | ${fecha} | Lugar: ${e.location}\n`;
          });
        }
      }
    } catch (dbErr) {
      console.warn("Error leyendo eventos:", dbErr);
    }

    const groq = createGroq({ apiKey: groqApiKey });
    
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Eres el Hermano Elías, el asistente de la Parroquia Santísima Trinidad. Responde amablemente en base a esta información: \n\n ${PARISH_STATIC_DATA} \n ${dynamicContext}`,
      messages: safeMessages,
      maxOutputTokens: 350,
    });

    // 🚀 Este es el método nativo exacto que la versión actual de 'ai' requiere
    return result.toDataStreamResponse();
    
  } catch (err: any) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
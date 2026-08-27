import { createClient } from "@supabase/supabase-js";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const config = {
  runtime: "edge",
};

const PARISH_STATIC_DATA = `
== IDENTIDAD ==
Nombre: Parroquia Santísima Trinidad de Tingo
Congregación: Carmelitas de María Inmaculada (CMI)
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
      throw new Error("Falta GROQ_API_KEY en las variables de entorno.");
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Formato inválido" }), { status: 400 });
    }

    const safeMessages = messages.slice(-10).map((m: any) => ({
      role: m.role,
      content: m.content || (Array.isArray(m.parts) ? m.parts[0]?.text : ""),
    })).filter((m: any) => m.content);

    // Contexto dinámico completo desde Supabase
    let dynamicContext = "";
    if (supabaseUrl && supabaseKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const today = new Date().toISOString().split("T")[0];

        // Consultar Horarios
        const { data: schedules } = await sb.from("schedules").select("category, day_label, time_label, notes").order("sort_order");
        if (schedules && schedules.length > 0) {
          dynamicContext += "\n\n== HORARIOS PARROQUIALES ==\n";
          schedules.forEach(s => {
            dynamicContext += `- [${s.category}] ${s.day_label}: ${s.time_label} ${s.notes ? `(${s.notes})` : ""}\n`;
          });
        }

        // Consultar Eventos
        const { data: events } = await sb.from("events").select("title, description, event_date, location").gte("event_date", today).order("event_date").limit(5);
        if (events && events.length > 0) {
          dynamicContext += "\n\n== PRÓXIMOS EVENTOS ==\n";
          events.forEach(e => {
            const fecha = new Date(e.event_date).toLocaleDateString("es-PE");
            dynamicContext += `- ${e.title} | Fecha: ${fecha} | Lugar: ${e.location || "Parroquia"}\n`;
          });
        }
      } catch (dbErr) {
        console.warn("Error obteniendo datos dinámicos en el chat:", dbErr);
      }
    }

    const groq = createGroq({ apiKey: groqApiKey });
    
    // 🚀 CAMBIO AQUÍ: Usamos generateText y esperamos la respuesta completa
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Eres el Hermano Elías, el asistente virtual de la Parroquia Santísima Trinidad de Tingo (Arequipa). Responde siempre con amabilidad, espíritu cristiano, cercanía y precisión basándote estrictamente en la siguiente información oficial:\n\n${PARISH_STATIC_DATA}\n${dynamicContext}`,
      messages: safeMessages,
      maxOutputTokens: 400,
    });

    // 🚀 CAMBIO AQUÍ: Devolvemos un JSON simple en lugar del stream complejo
    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (err: any) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
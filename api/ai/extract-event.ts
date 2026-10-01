import { createClient } from "@supabase/supabase-js";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return new Response(JSON.stringify({ error: "No autorizado. Inicia sesión en el panel." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Configuración Supabase faltante." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sbAuth = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authErr } = await sbAuth.auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Token inválido o expirado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY no configurada en Vercel." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json() as { imageBase64?: string; text?: string };
    const { imageBase64, text: postText } = body;

    if (!imageBase64 && !postText) {
      return new Response(JSON.stringify({ error: "Debes proporcionar una imagen o texto del evento." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const groq = createGroq({ apiKey });

    const prompt = `Eres un asistente de digitalización para la Parroquia Santísima Trinidad de Tingo, Arequipa, Perú.
Analiza la imagen del afiche o texto proporcionado y extrae los datos del evento en formato JSON estricto.

Año actual de referencia: ${new Date().getFullYear()}.

Responde ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin formato markdown adicional ni explicaciones):
{
  "title": "Título o tema central del evento (ej: La Familia Cristiana: Rol de los padres)",
  "event_date": "YYYY-MM-DDTHH:mm (fecha y hora en formato para input datetime-local, ej: 2026-10-02T19:00). Si la hora es '7 pm' pon '19:00'. Si no indica hora pon '18:00'. Si no indica año, usa ${new Date().getFullYear()})",
  "location": "Lugar específico si se menciona (ej: Parroquia Santiago Apóstol de Tiabaya o Templo Central Tingo). Si no se menciona pon 'Parroquia Santísima Trinidad de Tingo'",
  "description": "Breve descripción informativa del evento (máximo 2 a 3 oraciones), incluyendo lema, a quién va dirigido o detalles clave."
}`;

    let aiResponseText = "";

    if (imageBase64) {
      const result = await generateText({
        model: groq("qwen/qwen3.8-27b"),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt + (postText ? `\n\nTexto adicional del post: ${postText}` : "") },
              { type: "image", image: imageBase64 },
            ],
          },
        ],
        temperature: 0.1,
      });
      aiResponseText = result.text;
    } else {
      const result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: `${prompt}\n\nTexto del post a analizar:\n${postText}`,
        temperature: 0.1,
      });
      aiResponseText = result.text;
    }

    const cleaned = aiResponseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no devolvió un JSON válido: " + aiResponseText);
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      success: true,
      event: {
        title: extracted.title || "Nuevo Evento Parroquial",
        event_date: extracted.event_date || "",
        location: extracted.location || "Parroquia Santísima Trinidad de Tingo",
        description: extracted.description || "",
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[AI Extract Event Error]:", err);
    return new Response(JSON.stringify({ error: err.message || "Error al procesar con IA" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

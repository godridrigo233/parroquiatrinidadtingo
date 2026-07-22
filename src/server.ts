import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { createGroq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// DATOS ESTÁTICOS DE LA PARROQUIA
// ============================================================================
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
Trámites y secretaría de las capillas filiales: solo en la Sede Central

== CAPILLAS FILIALES ==
- Capilla María de la Merced: Amp. Pampa del Cusco | Misa: Domingos 6:00 p.m.
  Grupos: Catequistas — Jóvenes con Cristo (Hna. Milagros), Coro — Sangre Viva (Hno. Wilmer), Coro — Talita Kumy (Hno. Daniel)
- Capilla Virgen de Fátima: Pampa del Cusco | Misa: Domingos 10:00 a.m. | Encargado: Hno. Gilvert
- Capilla Virgen del Carmen: Plaza de Tingo Grande | Misa: Domingos 12:00 p.m.
  Grupos: Hermandad del Señor de los Milagros (Hno. Ernesto), Cofradía Virgen del Carmen (Hna. Sara)

== SACERDOTES ==
- Párroco: Rvdo. P. Tomy Thengumparambil, CMI
- Vicario parroquial: Rvdo. P. Manesh Kunnakkattu, CMI

== SECRETARÍA ==
Horario: Lunes a Sábado, 3:00 PM – 6:00 PM

== CÓMO LLEGAR AL TEMPLO ==
- Bus Cuenca 10 (SIT), color granate/rojo, destino Jacobo Hunter o Balneario de Jesús.
- Bajar en el "Cruce de Tingo" (aprox. 2–3 cuadras de la parroquia).
- Desde el Centro / Terminal Avelino: tomar unidades con destino Jacobo Hunter que pasan por Av. Alfonso Ugarte.
- Referencia: frente al parque principal de Tingo, Av. Alfonso Ugarte.

== HORARIOS DE MISA (base) ==
- Domingos: 8:00 AM y 6:00 PM
- Lunes a Viernes: 6:00 PM
- Sábados (vigilia): 6:00 PM
(Para horarios actualizados, ver sección HORARIOS ACTUALIZADOS más abajo)

== SACRAMENTO: BAUTISMO ==
Cuándo: Todos los sábados desde las 3:00 PM, previa programación
Anticipación mínima: 1 mes
Máximo padrinos: 2 (un padrino y una madrina)
Requisitos:
1. Copia de DNI de los padres y padrinos
2. Recibo de agua y de luz reciente (del domicilio de los padres)
3. Los padrinos deben estar casados por la Iglesia O ser solteros confirmados
4. Asistir a la charla pre-bautismal (obligatoria)
Nota: Niños mayores de 8 años deben completar catequesis previa antes del bautismo.

== SACRAMENTO: PRIMERA COMUNIÓN ==
Edad mínima: 9 años
Catequesis: 1 año de duración, inicia en marzo de cada año
Requisitos: pago de inscripción y documentación presentada en secretaría
Para más información e inscripción, acercarse a secretaría (Lunes a Sábado 3:00–6:00 PM).

== SACRAMENTO: MATRIMONIO ==
Anticipación mínima: 3 meses (90 días)
Atención para preparación: Lunes a Sábado, 3:00 PM – 6:00 PM | Tel: +51 915 049 850
Requisitos:
1. Partida de Bautismo original actualizada (de ambos contrayentes)
2. Constancia de Confirmación (de ambos contrayentes)
3. Partida de Nacimiento (de ambos)
4. Partida de Matrimonio Civil
5. Certificado de charla prematrimonial
6. 2 testigos que no sean familiares directos
7. DNI de los novios y de los testigos
8. Fotos carné de ambos novios
9. Padrinos casados por la Iglesia (con su partida de matrimonio religioso)
10. Completar 2 entrevistas con el sacerdote

== SACRAMENTO: CONFIRMACIÓN ==
Contactar a la parroquia para informarse sobre el siguiente proceso de confirmación.

== SACRAMENTO: RECONCILIACIÓN (CONFESIÓN) ==
No requiere inscripción previa.
Horario: Antes o después de cada misa, en el confesionario del templo.

== SACRAMENTO: UNCIÓN DE LOS ENFERMOS ==
Se solicita directamente al sacerdote en cualquier momento.
Atención a domicilio o en el templo.
Coordinar por teléfono (+51 915 049 850) o en secretaría.

== VOCACIONES / ORDEN SACERDOTAL ==
Conversar directamente con el párroco para el discernimiento vocacional.
`.trim();

// ============================================================================
// CONTEXTO DINÁMICO DESDE SUPABASE
// ============================================================================
async function buildParishContext(): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("[Chat] Falta SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY.");
    return "";
  }

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const today = new Date().toISOString().split("T")[0];

    const [
      { data: schedules },
      { data: events },
      { data: ministries },
      { data: donations },
    ] = await Promise.all([
      sb.from("schedules")
        .select("category, day_label, time_label, notes")
        .order("sort_order"),
      sb.from("events")
        .select("title, description, event_date, location")
        .gte("event_date", today)
        .order("event_date")
        .limit(10),
      sb.from("ministries")
        .select("name, description, leader, location")
        .order("created_at"),
      sb.from("donations_info")
        .select("title, bank_name, account_number, cci, description")
        .order("sort_order"),
    ]);

    let ctx = "";

    // ── Horarios ──────────────────────────────────────────────
    if (schedules && schedules.length > 0) {
      ctx += "\n\n== HORARIOS ACTUALIZADOS (base de datos) ==\n";
      const byCategory: Record<string, typeof schedules> = {};
      for (const s of schedules) {
        const cat = s.category ?? "otros";
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(s);
      }
      const catLabels: Record<string, string> = {
        misa: "MISAS", confesion: "CONFESIONES",
        catequesis: "CATEQUESIS", adoracion: "ADORACIÓN", secretaria: "SECRETARÍA",
      };
      for (const [cat, rows] of Object.entries(byCategory)) {
        ctx += `\n[${catLabels[cat] ?? cat.toUpperCase()}]\n`;
        for (const r of rows) {
          ctx += `  - ${r.day_label}: ${r.time_label}${r.notes ? ` (${r.notes})` : ""}\n`;
        }
      }
    }

    // ── Eventos ───────────────────────────────────────────────
    if (events && events.length > 0) {
      ctx += "\n\n== PRÓXIMOS EVENTOS ==\n";
      for (const e of events) {
        const fecha = new Date(e.event_date).toLocaleDateString("es-PE", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
        ctx += `\n- ${e.title} | Fecha: ${fecha}`;
        if (e.location) ctx += ` | Lugar: ${e.location}`;
        if (e.description) ctx += `\n  ${e.description}`;
        ctx += "\n";
      }
    } else {
      ctx += "\n\n== PRÓXIMOS EVENTOS ==\n- No hay eventos programados por el momento.\n";
    }

    // ── Ministerios ───────────────────────────────────────────
    if (ministries && ministries.length > 0) {
      ctx += "\n\n== MINISTERIOS Y GRUPOS PARROQUIALES (base de datos) ==\n";
      const bySede: Record<string, typeof ministries> = {};
      for (const m of ministries) {
        const sede = m.location ?? "Sede Central";
        if (!bySede[sede]) bySede[sede] = [];
        bySede[sede].push(m);
      }
      for (const [sede, items] of Object.entries(bySede)) {
        ctx += `\n[${sede.toUpperCase()}]\n`;
        for (const m of items) {
          ctx += `  - ${m.name}`;
          if (m.leader) ctx += ` (Encargado: ${m.leader})`;
          if (m.description) ctx += `\n    ${m.description}`;
          ctx += "\n";
        }
      }
    }

    // ── Donaciones ────────────────────────────────────────────
    if (donations && donations.length > 0) {
      ctx += "\n\n== CANALES DE DONACIÓN (base de datos) ==\n";
      for (const d of donations as any[]) {
        ctx += `\n- ${d.title} | ${d.bank_name}`;
        if (d.account_number) ctx += ` | Cuenta: ${d.account_number}`;
        if (d.cci)            ctx += ` | CCI: ${d.cci}`;
        if (d.description)    ctx += `\n  ${d.description}`;
        ctx += "\n";
      }
    }

    return ctx;
  } catch (err) {
    console.error("[Chat] Error fetching parish context from Supabase:", err);
    return "";
  }
}

// ============================================================================
// BOILERPLATE (sin cambios)
// ============================================================================
type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);
  if (!userRecord || now > userRecord.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (userRecord.count >= limit) return false;
  userRecord.count += 1;
  return true;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return false; }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return false;
  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) return false;
  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) return response;
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "ip-desconocida";

      if (url.pathname.startsWith("/admin")) {
        if (!checkRateLimit(ip, 3, 60 * 1000)) {
          console.warn(`[SEGURIDAD] Fuerza bruta en /admin. IP: ${ip}`);
          return new Response(JSON.stringify({ error: "Acceso denegado temporalmente por seguridad." }), {
            status: 429, headers: { "content-type": "application/json" },
          });
        }
      }

      if (url.pathname.startsWith("/api")) {
        if (!checkRateLimit(ip, 15, 60 * 1000)) {
          return new Response(JSON.stringify({ error: "Límite de peticiones alcanzado." }), {
            status: 429, headers: { "content-type": "application/json" },
          });
        }
      }

      // ── Chatbot AI ──────────────────────────────────────────
      if (url.pathname === "/api/chat" && request.method === "POST") {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error("[Chat] GROQ_API_KEY no encontrada");
          return new Response(JSON.stringify({ error: "API key no configurada" }), {
            status: 500, headers: { "content-type": "application/json" },
          });
        }
        try {
          const body = await request.json() as { messages: unknown };
          const raw = body?.messages;

          if (!Array.isArray(raw) || raw.length === 0) {
            return new Response(JSON.stringify({ error: "Formato inválido" }), {
              status: 400, headers: { "content-type": "application/json" },
            });
          }

          const safeMessages = raw
            .slice(-20)
            .filter((m) => {
              if (typeof m !== "object" || m === null) return false;
              const role = (m as Record<string, unknown>).role;
              return role === "user" || role === "assistant";
            })
            .map((m) => {
              const msg = m as Record<string, unknown>;
              const parts = Array.isArray(msg.parts) ? msg.parts : [];
              return {
                ...msg,
                parts: parts
                  .filter((p) => typeof p === "object" && p !== null && (p as Record<string, unknown>).type === "text")
                  .map((p) => ({
                    type: "text",
                    text: String((p as Record<string, unknown>).text ?? "").slice(0, 500),
                  })),
              };
            })
            .filter((m) => m.parts.length > 0);

          if (safeMessages.length === 0) {
            return new Response(JSON.stringify({ error: "Sin mensajes válidos" }), {
              status: 400, headers: { "content-type": "application/json" },
            });
          }

          const [modelMessages, dynamicContext] = await Promise.all([
            convertToModelMessages(safeMessages as Parameters<typeof convertToModelMessages>[0]),
            buildParishContext(),
          ]);

          const groq = createGroq({ apiKey });
          const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: `Eres el asistente virtual de la Parroquia Santísima Trinidad de Tingo, Arequipa, Perú.
Tu nombre es "Hermano Elías". Respondes de forma amable y pastoral.

REGLA FUNDAMENTAL: Solo responde con información que figure explícitamente en los DATOS DE LA PARROQUIA que se te proporcionan abajo. Si alguien pregunta algo que no está en esos datos, responde exactamente: "No tengo esa información. Por favor, contacta directamente a la parroquia al +51 915 049 850 o visita secretaría (Lun–Sáb 3:00–6:00 PM)."

ESTILO: Sé breve y directo. Máximo 3 oraciones por respuesta salvo que la pregunta requiera listar requisitos. Siempre en español.Y SI TE PREGUNTAN QUIÉN ERES O QUIÉN ES EL HERMANO ELÍAS, responde siempre con orgullo, calidez y amabilidad algo como esto:
"Soy el Hermano Elías, tu asistente parroquial virtual. Mi nombre rinde homenaje al Profeta Elías del Antiguo Testamento, quien es considerado el padre espiritual, inspirador y guía protector de toda la Orden del Carmelo (los Padres Carmelitas que dirigen nuestra parroquia en Tingo). ¡Estoy aquí para ayudarte a encontrar horarios de misas, información de sacramentos y guiarte en nuestra comunidad!"

---
DATOS DE LA PARROQUIA:

${PARISH_STATIC_DATA}${dynamicContext}
---`,
            messages: modelMessages,
            maxOutputTokens: 350,
          });
          return result.toUIMessageStreamResponse();
        } catch (err) {
          console.error("[Chat] Error en streamText:", err);
          return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
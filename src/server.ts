import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { createGroq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

// ============================================================================
// 1. DICCIONARIO Y LÓGICA DE RATE LIMITING (En Memoria)
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  
  const now = Date.now();

  const userRecord = rateLimitMap.get(ip);

  // Si es nuevo o ya pasó su castigo, reiniciar contador
  if (!userRecord || now > userRecord.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Si superó el límite, bloquear
  if (userRecord.count >= limit) {
    return false;
  }

  // Si está dentro del límite, sumar 1
  userRecord.count += 1;
  return true;
}
// ============================================================================

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
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // ============================================================================
      // 2. INTERCEPTOR DE SEGURIDAD (Antes de procesar la solicitud)
      // ============================================================================
      const url = new URL(request.url);
      const ip = 
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
        "ip-desconocida";

      // NIVEL 1: Protección Administrativa (Muy estricta)
      if (url.pathname.startsWith("/admin")) {
        // Solo 3 intentos por minuto para el acceso al panel admin
        if (!checkRateLimit(ip, 3, 60 * 1000)) {
          console.warn(`[SEGURIDAD CRÍTICA] Intento de fuerza bruta en /admin detectado. IP: ${ip}`);
          return new Response(JSON.stringify({ error: "Acceso denegado temporalmente por seguridad." }), {
            status: 429,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // NIVEL 2: Protección de APIs (Estándar)
      if (url.pathname.startsWith("/api")) {
        if (!checkRateLimit(ip, 15, 60 * 1000)) {
          return new Response(JSON.stringify({ error: "Límite de peticiones alcanzado." }), {
            status: 429,
            headers: { "content-type": "application/json" },
          });
        }
      }
      // ============================================================================

      // ── Chatbot AI ──────────────────────────────────────────────────────────
      if (url.pathname === "/api/chat" && request.method === "POST") {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error("[Chat] GROQ_API_KEY no encontrada en process.env");
          return new Response(JSON.stringify({ error: "API key no configurada" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        try {
          const body = await request.json() as { messages: unknown };
          const raw = body?.messages;

          // Seguridad: validar que sea array y no vacío
          if (!Array.isArray(raw) || raw.length === 0) {
            return new Response(JSON.stringify({ error: "Formato inválido" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          // Seguridad: solo últimos 20 mensajes, solo roles user/assistant,
          // texto truncado a 500 chars para evitar inyección masiva
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
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const modelMessages = await convertToModelMessages(safeMessages as Parameters<typeof convertToModelMessages>[0]);
          const groq = createGroq({ apiKey });
          const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: `Eres el asistente virtual de la Parroquia Santísima Trinidad de Tingo, Arequipa, Perú.
Tu nombre es "Asistente Parroquial". Respondes de forma amable y espiritual.
Ayudas con: horarios de misas y sacramentos, eventos parroquiales,
instrucciones para sacramentos (bautismo, matrimonio, primera comunión, confirmación),
información general de la parroquia y orientación espiritual básica.
Si no sabes algo específico, indícalo con humildad y sugiere contactar directamente a la parroquia.
Siempre responde en español con tono cálido y pastoral.
IMPORTANTE: Sé breve y directo. Máximo 3 oraciones por respuesta salvo que la pregunta requiera más detalle.`,
            messages: modelMessages,
            maxTokens: 350,
          });
          return result.toUIMessageStreamResponse();
        } catch (err) {
          console.error("[Chat] Error en streamText:", err);
          return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
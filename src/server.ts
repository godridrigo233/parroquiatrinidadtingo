import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
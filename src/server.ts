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

function checkRateLimit(ip: string): boolean {
  const limit = 5; // Máximo 15 peticiones...
  const windowMs = 60 * 1000; // ...por minuto
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
      
      // Proteger las rutas sensibles (Ajusta '/api' si tus rutas de acción se llaman diferente)
      if (url.pathname.startsWith("/api")) {
        // Extraer la IP real del cliente desde las cabeceras estándar de Edge/Vercel
        const ip = 
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
          request.headers.get("cf-connecting-ip") || 
          request.headers.get("x-real-ip") || 
          "ip-desconocida";

        const isAllowed = checkRateLimit(ip);

        if (!isAllowed) {
          console.warn(`[DEFENSA] Tráfico bloqueado para la IP: ${ip}`);
          
          return new Response(
            JSON.stringify({ 
              error: "Has superado el límite de peticiones. Por favor, espera un minuto." 
            }), 
            {
              status: 429,
              headers: { "content-type": "application/json" },
            }
          );
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
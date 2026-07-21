// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

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
Anticipación mínima: 1 mes | Máximo padrinos: 2 (un padrino y una madrina)
Requisitos:
1. Copia de DNI de los padres y padrinos
2. Recibo de agua y de luz reciente (del domicilio de los padres)
3. Los padrinos deben estar casados por la Iglesia O ser solteros confirmados
4. Asistir a la charla pre-bautismal (obligatoria)
Nota: Niños mayores de 8 años deben completar catequesis previa antes del bautismo.

== SACRAMENTO: PRIMERA COMUNIÓN ==
Edad mínima: 9 años | Catequesis: 1 año, inicia en marzo de cada año
Requisitos: pago de inscripción y documentación en secretaría.
Para inscripción, acercarse a secretaría (Lunes a Sábado 3:00–6:00 PM).

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
9. Padrinos casados por la Iglesia (con partida de matrimonio religioso)
10. Completar 2 entrevistas con el sacerdote

== SACRAMENTO: CONFIRMACIÓN ==
Contactar a la parroquia para informarse sobre el siguiente proceso.

== SACRAMENTO: RECONCILIACIÓN (CONFESIÓN) ==
No requiere inscripción. Horario: antes o después de cada misa, en el confesionario del templo.

== SACRAMENTO: UNCIÓN DE LOS ENFERMOS ==
Se solicita directamente al sacerdote. Atención a domicilio o en el templo.
Coordinar por teléfono (+51 915 049 850) o en secretaría.

== VOCACIONES / ORDEN SACERDOTAL ==
Conversar directamente con el párroco para el discernimiento vocacional.
`.trim();

// ============================================================================
// CONTEXTO DINÁMICO DESDE SUPABASE (dev)
// ============================================================================
async function buildDevParishContext(): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("[Chat dev] Falta SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY.");
    return "";
  }
  try {
    const { createClient } = await import("@supabase/supabase-js");
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
    console.error("[Chat dev] Error fetching Supabase context:", err);
    return "";
  }
}

// ============================================================================
// PLUGIN DEV
// ============================================================================
function chatDevPlugin(): Plugin {
  return {
    name: "parish-chat-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res, next) => {
        if (req.method !== "POST") return next();
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", async () => {
          const apiKey = process.env.GROQ_API_KEY;
          console.log("[Chat dev] body recibido, key:", apiKey ? `PRESENTE (${apiKey.slice(0, 8)}...)` : "AUSENTE");
          try {
            const { createGroq } = await import("@ai-sdk/groq");
            const { streamText, convertToModelMessages } = await import("ai");
            const parsed = JSON.parse(body) as { messages: unknown };
            const raw = parsed?.messages;

            if (!Array.isArray(raw) || raw.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Formato inválido" }));
              return;
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
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Sin mensajes válidos" }));
              return;
            }

            console.log("[Chat dev] mensajes a enviar:", safeMessages.length);
            const [modelMessages, dynamicContext] = await Promise.all([
              convertToModelMessages(safeMessages as Parameters<typeof convertToModelMessages>[0]),
              buildDevParishContext(),
            ]);

            const groq = createGroq({ apiKey });
            const result = streamText({
              model: groq("llama-3.3-70b-versatile"),
              system: `Eres el asistente virtual de la Parroquia Santísima Trinidad de Tingo, Arequipa, Perú.
Tu nombre es "Hermano Elías". Respondes de forma amable y pastoral.

REGLA FUNDAMENTAL: Solo responde con información que figure explícitamente en los DATOS DE LA PARROQUIA que se te proporcionan abajo. Si alguien pregunta algo que no está en esos datos, responde exactamente: "No tengo esa información. Por favor, contacta directamente a la parroquia al +51 915 049 850 o visita secretaría (Lun–Sáb 3:00–6:00 PM)."

ESTILO: Sé breve y directo. Máximo 3 oraciones por respuesta salvo que la pregunta requiera listar requisitos. Siempre en español.

---
DATOS DE LA PARROQUIA:

${PARISH_STATIC_DATA}${dynamicContext}
---`,
              messages: modelMessages,
              maxOutputTokens: 350,
            });
            console.log("[Chat dev] llamando pipeUIMessageStreamToResponse");
            result.pipeUIMessageStreamToResponse(res as import("node:http").ServerResponse, {
              onError: (err) => { console.error("[Chat dev] error:", String(err)); return String(err); },
            });
          } catch (err) {
            console.error("[Chat dev] catch:", err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: true,
  vite: {
    ssr: {
      noExternal: ["ai", "@ai-sdk/groq", "@ai-sdk/react"],
    },
    plugins: [chatDevPlugin()],
  },
});
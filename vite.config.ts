  // @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
  // or the app will break with duplicate plugins:
  //   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
  //     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
  //     error logger plugins, and sandbox detection (port/host/strictPort).
  // You can pass additional config via defineConfig({ vite: { ... } }) if needed.
  import { defineConfig } from "@lovable.dev/vite-tanstack-config";
  import type { Plugin } from "vite";

  const SYSTEM_PROMPT = `Eres el asistente virtual de la Parroquia Santísima Trinidad de Tingo, Arequipa, Perú.
Tu nombre es "Asistente Parroquial". Respondes de forma amable, concisa y espiritual.
Ayudas con: horarios de misas y sacramentos, información sobre eventos parroquiales,
instrucciones para recibir sacramentos (bautismo, matrimonio, primera comunión, confirmación),
información general de la parroquia y orientación espiritual básica.
Si no sabes algo específico, indícalo con humildad y sugiere contactar directamente.
Siempre responde en español. Mantén un tono cálido, pastoral y cercano.`;

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
              const parsed = JSON.parse(body) as { messages: unknown[] };
              console.log("[Chat dev] mensajes a enviar:", parsed.messages.length);
              const groq = createGroq({ apiKey });
              const result = streamText({
                model: groq("llama-3.3-70b-versatile"),
                system: SYSTEM_PROMPT,
                messages: convertToModelMessages(parsed.messages as Parameters<typeof convertToModelMessages>[0]),
                maxTokens: 500,
              });
              console.log("[Chat dev] llamando pipeUIMessageStreamToResponse");
              result.pipeUIMessageStreamToResponse(res as import("node:http").ServerResponse, {
                onError: (err) => { console.error("[Chat dev] Gemini error:", String(err)); return String(err); },
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

  // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
  // @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
  export default defineConfig({
    tanstackStart: {
      server: { entry: "server" }
      },
    nitro: true,
    vite: {
      ssr: {
        noExternal: ["ai", "@ai-sdk/groq", "@ai-sdk/react"],
      },
      plugins: [chatDevPlugin()],
    },
  });

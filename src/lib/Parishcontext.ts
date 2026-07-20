// src/lib/parishContext.ts
// ─────────────────────────────────────────────────────────────
//  Contexto dinámico para el Asistente Parroquial
//  Jala en tiempo real desde Supabase lo que hay en la web
// ─────────────────────────────────────────────────────────────

import { supabase } from "@/integrations/supabase/client";

// ── Solo lo que NUNCA cambia va aquí ──────────────────────────
export const PARISH_STATIC_DATA = `
## IDENTIDAD
- Nombre: Parroquia Santísima Trinidad de Tingo
- Congregación: Carmelitas de María Inmaculada (CMI)
- Diócesis: Arquidiócesis de Arequipa

## CONTACTO
- Dirección: Calle Ferrocarril 200, Av. Alfonso Ugarte, Tingo – Cercado, Arequipa
- Teléfono / WhatsApp: +51 915 049 850
- Correo: pstrinidadtingo@gmail.com
- Facebook: facebook.com/parroquiasantisimatrinidadtingo
- Instagram: instagram.com/stma_trinidad_tingo
- Web: https://parroquiatrinidadtingo.vercel.app

## CÓMO LLEGAR
- Bus Cuenca 10 (SIT) color granate, destino Jacobo Hunter / Balneario de Jesús.
- Bajar en "Cruce de Tingo" (2–3 cuadras de la parroquia).
- Desde el Centro / Terminal Avelino: tomar unidades con destino Jacobo Hunter.
- Referencia: frente al parque principal de Tingo, Av. Alfonso Ugarte.

## SACRAMENTOS (requisitos fijos)
- Bautismo: partida de nacimiento, DNI de padres y padrinos (padrinos deben ser católicos confirmados). Curso prebautismal obligatorio.
- Matrimonio: bautismo y confirmación de ambos, curso prematrimonial, partidas de bautismo recientes (<6 meses), DNI + 2 testigos. Coordinar con 6 meses de anticipación.
- Primera Comunión y Confirmación: catequesis previa de aprox. 1 año. Inscripción en secretaría.
- Unción de los Enfermos: urgencias llamar al +51 915 049 850.
- Todos los sacramentos tienen ofrenda voluntaria, no precio fijo.

## SECRETARÍA
- Horario: Lunes a Sábado, 3:00 PM – 6:00 PM
- Servicios: solicitud de sacramentos, certificados, partidas parroquiales, quinceañeros, misas de difuntos.

## CAPILLAS DE LA PARROQUIA
- Capilla María de la Merced
- Capilla Virgen del Carmen
- Capilla Virgen de Fátima
(Horarios de capillas: consultar en secretaría)
`.trim();


// ── Todo lo que sí cambia se jala de Supabase ─────────────────
export async function getDynamicParishContext(): Promise<string> {
  const sections: string[] = [];

  try {
    // 1. HORARIOS
    const { data: schedules } = await supabase
      .from("schedules")
      .select("category, day_label, time_label, notes")
      .order("sort_order", { ascending: true });

    if (schedules && schedules.length > 0) {
      const grouped: Record<string, string[]> = {};
      const labels: Record<string, string> = {
        misa:       "Misas",
        confesion:  "Confesiones",
        catequesis: "Catequesis",
        adoracion:  "Adoración",
        secretaria: "Secretaría",
      };
      for (const s of schedules) {
        const cat = labels[s.category] ?? s.category;
        if (!grouped[cat]) grouped[cat] = [];
        const nota = s.notes ? ` (${s.notes})` : "";
        grouped[cat].push(`  - ${s.day_label}: ${s.time_label}${nota}`);
      }
      const lines = ["## HORARIOS (desde base de datos)"];
      for (const [cat, rows] of Object.entries(grouped)) {
        lines.push(`### ${cat}`);
        lines.push(...rows);
      }
      sections.push(lines.join("\n"));
    }

    // 2. EVENTOS PRÓXIMOS
    const { data: events } = await supabase
      .from("events")
      .select("title, description, event_date, location")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(10);

    if (events && events.length > 0) {
      const lines = ["## PRÓXIMOS EVENTOS (desde base de datos)"];
      for (const e of events) {
        const fecha = new Date(e.event_date).toLocaleDateString("es-PE", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
        lines.push(`- **${e.title}** — ${fecha}${e.location ? `, ${e.location}` : ""}`);
        if (e.description) lines.push(`  ${e.description}`);
      }
      sections.push(lines.join("\n"));
    } else {
      sections.push("## PRÓXIMOS EVENTOS\n- No hay eventos programados por el momento.");
    }

    // 3. MINISTERIOS
    const { data: ministries } = await supabase
      .from("ministries")
      .select("name, description, leader, location")
      .order("created_at", { ascending: true });

    if (ministries && ministries.length > 0) {
      const lines = ["## MINISTERIOS Y GRUPOS (desde base de datos)"];
      for (const m of ministries) {
        const encargado = m.leader ? `, encargado: ${m.leader}` : "";
        const sede = m.location ? ` [${m.location}]` : "";
        lines.push(`- **${m.name}**${sede}${encargado}`);
        if (m.description) lines.push(`  ${m.description}`);
      }
      sections.push(lines.join("\n"));
    }

    // 4. CANALES DE DONACIÓN
    const { data: donations } = await supabase
      .from("donations_info" as never)
      .select("title, bank_name, account_number, cci, description")
      .order("sort_order", { ascending: true });

    if (donations && (donations as any[]).length > 0) {
      const lines = ["## DONACIONES Y CANALES DE PAGO (desde base de datos)"];
      for (const d of donations as any[]) {
        lines.push(`- **${d.title}** (${d.bank_name})`);
        if (d.account_number) lines.push(`  Cuenta: ${d.account_number}`);
        if (d.cci)            lines.push(`  CCI: ${d.cci}`);
        if (d.description)    lines.push(`  ${d.description}`);
      }
      sections.push(lines.join("\n"));
    }

  } catch (err) {
    console.error("[parishContext] Error jalando datos de Supabase:", err);
    sections.push("## DATOS DINÁMICOS\n- (no disponibles temporalmente)");
  }

  return sections.join("\n\n");
}
import { supabase } from "@/integrations/supabase/client";

export type ActivityAction = "create" | "update" | "delete";

interface LogActivityParams {
  action: ActivityAction;
  entity: string;        // ej: "catechist", "event", "gallery_image"
  entityLabel?: string;  // ej: el nombre o título, para que el log sea legible
  entityId?: string;
}

/**
 * Registra una acción en activity_log. No lanza errores hacia afuera:
 * si falla el log, solo lo deja en consola, para que nunca bloquee
 * la operación principal (crear/editar/borrar) que sí le importa al usuario.
 */
export async function logActivity({ action, entity, entityLabel, entityId }: LogActivityParams) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const actorEmail = userData?.user?.email    ?? null;

    const { error } = await supabase.from("activity_log").insert({
      actor_email: actorEmail,
      action,
      entity,
      entity_label: entityLabel ?? null,
      entity_id: entityId ?? null,
    });

    if (error) console.error("No se pudo registrar la actividad:", error.message);
  } catch (err) {
    console.error("Error inesperado al registrar actividad:", err);
  }
}
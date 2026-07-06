import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUserRole } from "@/utils/useUserRole";
import { toast } from "sonner";
import { z } from "zod";
import {
  Calendar as CalendarIcon,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  X,
  Save,
  ShieldAlert,
  FileText,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/eventos")({
  head: () => ({
    meta: [
      { title: "Gestión de Eventos · Parroquia" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <EventosAdminGate />
    </ProtectedRoute>
  ),
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  created_at: string;
};

const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(200, "Máximo 200 caracteres"),
  description: z.string().trim().max(2000, "Máximo 2000 caracteres").optional(),
  event_date: z.string().min(1, "La fecha es obligatoria"),
  location: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
});

function EventosAdminGate() {
  const { role, loadingRole } = useUserRole();

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-elegant">
          <div className="mx-auto w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={28} />
          </div>
          <h1 className="font-display text-2xl text-primary mb-2">
            Acceso denegado
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta sección es exclusiva para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <EventosAdmin />;
}

function EventosAdmin() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");

  // valor mínimo para el input datetime-local (ahora, formato local)
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const minDateTime = new Date(now.getTime() - tzOffset)
    .toISOString()
    .slice(0, 16);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, event_date, location, created_at")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true });

    if (error) {
      toast.error("Error al cargar eventos: " + error.message);
    } else {
      setEvents((data as EventRow[]) || []);
    }
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = eventSchema.safeParse({
      title,
      description: description || undefined,
      event_date: eventDate,
      location: location || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Datos inválidos");
      return;
    }

    // Validación: no permitir fechas pasadas
    const selected = new Date(eventDate);
    if (selected.getTime() < Date.now()) {
      toast.error("La fecha del evento no puede ser en el pasado");
      return;
    }

    setSaving(true);

    // TODO: AQUÍ SE CONFIGURARÁ EL WEBHOOK PARA NOTIFICACIONES AUTOMÁTICAS
    const { error } = await supabase.from("events").insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      event_date: selected.toISOString(),
      location: parsed.data.location ?? null,
    });

    setSaving(false);

    if (error) {
      toast.error("No se pudo crear el evento: " + error.message);
      return;
    }

    toast.success("Evento creado correctamente");
    resetForm();
    setShowForm(false);
    fetchEvents();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar: " + error.message);
      return;
    }
    toast.success("Evento eliminado");
    setDeleteId(null);
    fetchEvents();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-PE", {
      dateStyle: "full",
      timeStyle: "short",
    });
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-primary">
              Gestión de Eventos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Publica y administra los próximos eventos de la parroquia.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm((s) => !s);
              if (showForm) resetForm();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-elegant"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cerrar" : "Nuevo Evento"}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-elegant mb-8 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <h2 className="font-display text-xl text-primary mb-5 flex items-center gap-2">
              <CalendarIcon size={20} className="text-gold" />
              Nuevo evento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Título *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="Ej: Misa de Aniversario"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:border-gold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Fecha y hora *
                </label>
                <input
                  required
                  type="datetime-local"
                  value={eventDate}
                  min={minDateTime}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:border-gold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={200}
                  placeholder="Ej: Templo principal"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:border-gold outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Detalles del evento…"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:border-gold outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-secondary transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-primary font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Guardando…" : "Guardar evento"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de eventos */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-primary">
            Próximos eventos
          </h2>
          <span className="text-xs text-muted-foreground">
            {events.length} programado{events.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
            <CalendarIcon
              size={40}
              className="mx-auto text-muted-foreground/40 mb-3"
            />
            <p className="text-muted-foreground">
              No hay eventos futuros programados.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((ev) => (
              <article
                key={ev.id}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-elegant transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl text-primary mb-2">
                      {ev.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-gold" />
                        {formatDate(ev.event_date)}
                      </span>
                      {ev.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-gold" />
                          {ev.location}
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-sm text-foreground/80 flex gap-2">
                        <FileText
                          size={14}
                          className="text-muted-foreground/60 mt-0.5 shrink-0"
                        />
                        <span className="line-clamp-3">{ev.description}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteId(ev.id)}
                    aria-label="Eliminar evento"
                    className="shrink-0 p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Confirmación de eliminación */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será removido
              permanentemente del calendario parroquial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

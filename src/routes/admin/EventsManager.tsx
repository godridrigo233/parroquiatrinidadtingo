import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/utils/Logactivity";

// ────────────────────────────────────────────────
//  useTable — ahora registra el delete en activity_log
//  (Reemplaza tu useTable actual en admin/index.tsx por este,
//  así TODOS los managers que ya usan useTable quedan auditados
//  sin tener que tocarlos uno por uno.)
// ────────────────────────────────────────────────
function useTable<T extends { id: string }>(
  table: string,
  orderBy: string,
  ascending = false,
  // etiqueta opcional para identificar el registro en el log,
  // ej: (item) => item.title  ó  (item) => item.full_name
  getLabel?: (item: T) => string
) {
  const [items, setItems] = useState<T[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table as never).select("*").order(orderBy, { ascending });
    if (data) setItems(data as T[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const remove = async (id: string, askConfirm: () => Promise<boolean>) => {
    const ok = await askConfirm();
    if (!ok) return false;

    const item = items.find((i) => i.id === id);

    const { error } = await supabase.from(table as never).delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar", { description: error.message });
      return false;
    }

    logActivity({
      action: "delete",
      entity: table,
      entityLabel: item && getLabel ? getLabel(item) : undefined,
      entityId: id,
    });

    load();
    return true;
  };

  return { items, load, remove };
}

// ────────────────────────────────────────────────
//  Auxiliares compartidos (copiados sin cambios desde admin/index.tsx
//  para que este archivo funcione de forma independiente)
// ────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card rounded-2xl shadow-card border border-border p-6 ${className}`}>{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2.5 rounded-lg border border-input bg-background outline-none focus:border-gold text-sm transition-colors ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full px-3 py-2.5 rounded-lg border border-input bg-background outline-none focus:border-gold text-sm resize-none transition-colors ${props.className ?? ""}`} />;
}
function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="px-4 py-2.5 rounded-lg bg-gradient-gold text-primary font-semibold text-sm hover:shadow-card disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all" />;
}

function useConfirm() {
  const [promise, setPromise] = useState<{ resolve: (v: boolean) => void } | null>(null);
  const ask = () => new Promise<boolean>((resolve) => setPromise({ resolve }));
  const Dialog = () => {
    if (!promise) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => { promise.resolve(false); setPromise(null); }}>
        <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 text-center shadow-elegant animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Trash2 className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="font-display text-2xl text-primary mb-2">¿Eliminar registro?</h3>
          <p className="text-sm text-muted-foreground mb-6">Esta acción es permanente y no se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { promise.resolve(false); setPromise(null); }}
              className="flex-1 py-2.5 rounded-lg border border-border hover:bg-secondary font-medium transition-colors text-sm">
              Cancelar
            </button>
            <button onClick={() => { promise.resolve(true); setPromise(null); }}
              className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium flex items-center justify-center gap-2 text-sm">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };
  return { ask, Dialog };
}

function EditModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg my-8 animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-xl text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  SECCIÓN: EVENTOS
// ────────────────────────────────────────────────
type EventRow = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url?: string | null };

export function EventsManager({ showToast }: { showToast?: (m: string, t?: "success" | "error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<EventRow>("events", "event_date", true, (e) => e.title);
  const empty = { title: "", description: "", event_date: "", location: "" };
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Subir afiche (si existe) al bucket público de imágenes
    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        setSaving(false);
        toast.error("Formato no permitido", { description: "Usa PNG, JPG o JPEG." });
        return;
      }
      const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("parroquia-images")
        .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
      if (upErr) {
        setSaving(false);
        toast.error("No se pudo subir la imagen", { description: upErr.message });
        return;
      }
      image_url = supabase.storage.from("parroquia-images").getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("events")
      .insert({ ...form, event_date: new Date(form.event_date).toISOString(), image_url })
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error("No se pudo crear el evento", { description: error.message });
      showToast?.(error.message, "error");
      return;
    }

    // Notificación automática vía Webhook (Make.com)
    try {
      await fetch("https://hook.us2.make.com/k1clffm3rgfvp43hww8j9gokoty7y2gm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          event_date: new Date(form.event_date).toISOString(),
          location: form.location,
          description: form.description,
          image_url,
        }),
      });
    } catch (webhookError) {
      console.error("Webhook de notificación falló:", webhookError);
    }

    toast.success(`Evento "${form.title}" publicado`);
    showToast?.("Evento creado");


    logActivity({
      action: "create",
      entity: "events",
      entityLabel: form.title,
      entityId: data?.id,
    });

    setForm(empty);
    setImageFile(null);
    load();
  };


  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    const { error } = await supabase.from("events").update({
      title: editing.title,
      description: editing.description,
      location: editing.location,
      event_date: new Date(editing.event_date).toISOString(),
    }).eq("id", editing.id);

    setSaving(false);

    if (error) {
      toast.error("No se pudo actualizar el evento", { description: error.message });
      showToast?.(error.message, "error");
      return;
    }

    toast.success(`Evento "${editing.title}" actualizado`);
    showToast?.("Evento actualizado");

    logActivity({
      action: "update",
      entity: "events",
      entityLabel: editing.title,
      entityId: editing.id,
    });

    setEditing(null);
    load();
  };

  const handleDelete = async (e: EventRow) => {
    const ok = await remove(e.id, confirm.ask);
    if (ok) {
      toast.success(`Evento "${e.title}" eliminado`);
      showToast?.("Eliminado");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-lg text-primary mb-1">Nuevo evento</h2>
        <p className="text-xs text-muted-foreground mb-4">Aparecerá en la página pública.</p>
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Título del evento" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input required type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
          <Input placeholder="Lugar (opcional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <Textarea placeholder="Descripción breve…" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}>
            <Plus size={15} /> {saving ? "Publicando…" : "Publicar evento"}
          </PrimaryBtn>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm">
            Sin eventos aún — crea el primero.
          </div>
        )}
        {items.map(e => (
          <div key={e.id} className="bg-card rounded-xl p-5 border border-border flex gap-4 items-start shadow-sm hover:border-gold/40 transition-colors">
            <div className="shrink-0 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center min-w-[3.5rem]">
              <span className="block text-[10px] uppercase font-bold text-blue-400">{new Date(e.event_date).toLocaleDateString('es-PE', { month: 'short' })}</span>
              <span className="block text-xl font-display text-blue-700 leading-none">{new Date(e.event_date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-primary leading-tight">{e.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{new Date(e.event_date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}{e.location ? ` · 📍 ${e.location}` : ""}</p>
              {e.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{e.description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing({ ...e, event_date: e.event_date.substring(0, 16) })}
                className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"><Pencil size={15} /></button>
              <button onClick={() => handleDelete(e)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar evento">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <Input required type="datetime-local" value={editing.event_date} onChange={e => setEditing({ ...editing, event_date: e.target.value })} />
            <Input placeholder="Lugar" value={editing.location ?? ""} onChange={e => setEditing({ ...editing, location: e.target.value })} />
            <Textarea rows={3} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <PrimaryBtn type="submit" disabled={saving}>
              <Save size={15} /> {saving ? "Guardando…" : "Guardar cambios"}
            </PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}
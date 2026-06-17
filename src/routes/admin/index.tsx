import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, Plus, Trash2, Pencil, X, Calendar, Clock, 
  Users, Image as ImageIcon, Save, AlertCircle, CheckCircle2, Heart 
} from "lucide-react";
import imageCompression from 'browser-image-compression';

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Panel administrador · Parroquia" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

type Tab = "events" | "schedules" | "ministries" | "gallery" | "donations";

const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "schedules", label: "Horarios", icon: Clock },
  { id: "ministries", label: "Ministerios", icon: Users },
  { id: "gallery", label: "Galería", icon: ImageIcon },
  { id: "donations", label: "Donaciones", icon: Heart },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("events");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      setReady(true);
    })();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!ready) return <div className="min-h-screen bg-secondary/40 flex items-center justify-center text-muted-foreground">Cargando…</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-secondary/40 flex items-center justify-center p-6">
        <div className="max-w-md bg-card rounded-2xl p-8 shadow-card border border-border text-center">
          <h1 className="font-display text-2xl text-primary">Acceso restringido</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tu cuenta <strong>{email}</strong> no tiene rol de administrador asignado.
          </p>
          <button onClick={logout} className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40 relative">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="" className="h-9 w-9" />
            <div className="leading-tight">
              <p className="font-display text-base text-primary">Panel administrador</p>
              <p className="text-[11px] text-muted-foreground">Parroquia Santísima Trinidad</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
            <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5 hover:bg-border transition-colors">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? "border-gold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-5 lg:p-8">
        {tab === "events" && <EventsManager showToast={showToast} />}
        {tab === "schedules" && <SchedulesManager showToast={showToast} />}
        {tab === "ministries" && <MinistriesManager showToast={showToast} />}
        {tab === "gallery" && <GalleryManager showToast={showToast} />}
        {tab === "donations" && <DonationsManager showToast={showToast} />}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-5 bg-card border border-border">
          {toast.type === 'success' ? <CheckCircle2 className="text-green-500" size={20}/> : <AlertCircle className="text-destructive" size={20}/>}
          <span className="text-sm font-medium text-foreground">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ---- AUXILIARES COMPARTIDOS ----
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card rounded-2xl shadow-card border border-border p-6">{children}</div>;
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
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { promise.resolve(false); setPromise(null); }}>
        <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 text-center shadow-elegant animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Trash2 className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="font-display text-2xl text-primary mb-2">¿Eliminar registro?</h3>
          <p className="text-sm text-muted-foreground mb-6">Esta acción es permanente.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { promise.resolve(false); setPromise(null); }} className="flex-1 py-2.5 rounded-lg border border-border hover:bg-secondary font-medium transition-colors">Cancelar</button>
            <button onClick={() => { promise.resolve(true); setPromise(null); }} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium flex items-center justify-center gap-2"><Trash2 size={16}/> Eliminar</button>
          </div>
        </div>
      </div>
    );
  };
  return { ask, Dialog };
}

function useTable<T extends { id: string }>(table: string, orderBy: string, ascending = false) {
  const [items, setItems] = useState<T[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table as never).select("*").order(orderBy, { ascending });
    if (data) setItems(data as T[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const remove = async (id: string, askConfirm: () => Promise<boolean>) => {
    const ok = await askConfirm();
    if (!ok) return false;
    await supabase.from(table as never).delete().eq("id", id);
    load();
    return true;
  };
  return { items, load, remove };
}

function EditModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg my-8 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-xl text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---- SECCIÓN: EVENTOS ----
type EventRow = { id: string; title: string; description: string | null; event_date: string; location: string | null };
function EventsManager({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<EventRow>("events", "event_date", true);
  const empty = { title: "", description: "", event_date: "", location: "" };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<EventRow | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({ ...form, event_date: new Date(form.event_date).toISOString() });
    if (error) { showToast(error.message, "error"); return; }
    setForm(empty); showToast("Evento creado"); load();
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const { error } = await supabase.from("events").update({
      title: editing.title, description: editing.description, location: editing.location, event_date: new Date(editing.event_date).toISOString(),
    }).eq("id", editing.id);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(null); showToast("Evento actualizado"); load();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo evento</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input required placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input required type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          <Input placeholder="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Textarea placeholder="Descripción" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit"><Plus size={16} /> Crear</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {items.map((e) => (
          <div key={e.id} className="bg-card rounded-xl p-5 border border-border flex justify-between shadow-sm">
            <div>
              <p className="text-xs text-gold uppercase font-mono">{new Date(e.event_date).toLocaleString("es-PE")}</p>
              <p className="font-display text-lg text-primary">{e.title}</p>
              {e.location && <p className="text-xs text-muted-foreground">📍 {e.location}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setEditing({ ...e, event_date: `${e.event_date.substring(0,16)}` })} className="text-primary hover:bg-secondary p-2 rounded-lg"><Pencil size={16} /></button>
              <button onClick={async () => { const ok = await remove(e.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar evento">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Input required type="datetime-local" value={editing.event_date} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} />
            <Input placeholder="Ubicación" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
            <Textarea placeholder="Descripción" rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <PrimaryBtn type="submit"><Save size={16} /> Guardar</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}

// ---- SECCIÓN: HORARIOS ----
type ScheduleRow = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
function SchedulesManager({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<ScheduleRow>("schedules", "sort_order", true);
  const empty = { category: "misa", day_label: "", time_label: "", notes: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<ScheduleRow | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 10;
    const { error } = await supabase.from("schedules").insert({ ...form, sort_order: form.sort_order || nextOrder });
    if (error) { showToast(error.message, "error"); return; }
    setForm(empty); showToast("Horario creado"); load();
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const { error } = await supabase.from("schedules").update({
      category: editing.category, day_label: editing.day_label, time_label: editing.time_label, notes: editing.notes, sort_order: editing.sort_order,
    }).eq("id", editing.id);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(null); showToast("Horario actualizado"); load();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo horario</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
            <option value="misa">Santa Misa</option>
            <option value="confesion">Confesiones</option>
            <option value="catequesis">Catequesis</option>
            <option value="adoracion">Adoración</option>
            <option value="pastoral">Pastoral</option>
            <option value="secretaria">Secretaría</option>
          </select>
          <Input required placeholder="Día (ej: Domingos)" value={form.day_label} onChange={(e) => setForm({ ...form, day_label: e.target.value })} />
          <Input required placeholder="Hora (ej: 10:00 AM)" value={form.time_label} onChange={(e) => setForm({ ...form, time_label: e.target.value })} />
          <Input placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Input type="number" placeholder="Orden" value={form.sort_order || ""} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
          <PrimaryBtn type="submit"><Plus size={16} /> Agregar</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-2">
        {items.map((s) => (
          <div key={s.id} className="bg-card rounded-xl p-4 border border-border flex justify-between items-center">
            <div>
              <p className="text-xs text-gold uppercase font-semibold">{s.category} · #{s.sort_order}</p>
              <p className="text-sm font-semibold">{s.day_label} · <span className="text-muted-foreground">{s.time_label}</span></p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing({ ...s, notes: s.notes ?? "" })} className="text-primary hover:bg-secondary p-2 rounded-lg"><Pencil size={16} /></button>
              <button onClick={async () => { const ok = await remove(s.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <confirm.Dialog />
    </div>
  );
}

// ---- SECCIÓN: MINISTERIOS ----
type MinistryRow = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
function MinistriesManager({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<MinistryRow>("ministries", "created_at", true);
  const empty = { name: "", description: "", leader: "", schedule: "", image_url: "" };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<MinistryRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadImageToSupabase = async (fileToUpload: File) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressedFile = await imageCompression(fileToUpload, options);
    const fileExt = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `ministerios/${fileName}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(filePath, compressedFile);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('parroquia-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let url = null; if (file) url = await uploadImageToSupabase(file);
      const { error } = await supabase.from("ministries").insert({
        name: form.name, description: form.description || null, leader: form.leader || null, schedule: form.schedule || null, image_url: url,
      });
      if (error) throw error;
      setForm(empty); setFile(null); showToast("Ministerio agregado"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try {
      let finalUrl = editing.image_url; if (file) finalUrl = await uploadImageToSupabase(file);
      const { error } = await supabase.from("ministries").update({
        name: editing.name, description: editing.description || null, leader: editing.leader || null, schedule: editing.schedule || null, image_url: finalUrl,
      }).eq("id", editing.id);
      if (error) throw error;
      setEditing(null); setFile(null); showToast("Ministerio actualizado"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo ministerio</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Encargado" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} />
          <Input placeholder="Horario" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
          <div className="border border-input rounded-lg p-2 bg-background">
            <input type="file" accept="image/*" className="w-full text-sm text-muted-foreground file:mr-4 file:py-2" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          </div>
          <Textarea placeholder="Descripción" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={16} /> {saving ? "Guardando..." : "Agregar"}</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {items.map((m) => (
          <div key={m.id} className="bg-card rounded-xl p-5 border border-border flex gap-4 items-start shadow-sm">
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center border">
              {m.image_url ? <img src={m.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground/40" size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg text-primary">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.leader} · {m.schedule}</p>
              {m.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => { setEditing(m); setFile(null); }} className="text-primary hover:bg-secondary p-2 rounded-lg"><Pencil size={16} /></button>
              <button onClick={async () => { const ok = await remove(m.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar ministerio">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input placeholder="Encargado" value={editing.leader ?? ""} onChange={(e) => setEditing({ ...editing, leader: e.target.value })} />
            <Input placeholder="Horario" value={editing.schedule ?? ""} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} />
            <div className="border border-input rounded-lg p-2 bg-background">
              <input type="file" accept="image/*" className="w-full text-sm text-muted-foreground file:mr-4" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            </div>
            <Textarea placeholder="Descripción" rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <PrimaryBtn type="submit" disabled={saving}><Save size={16} /> Guardar cambios</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}

// ---- SECCIÓN: GALERÍA ----
type GalleryRow = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };
function GalleryManager({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<GalleryRow>("gallery_images", "sort_order", true);
  const empty = { title: "", category: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadImageToSupabase = async (fileToUpload: File) => {
    const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
    const compressedFile = await imageCompression(fileToUpload, options);
    const fileExt = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `galeria/${fileName}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(filePath, compressedFile);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('parroquia-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file) { showToast("Selecciona una foto", "error"); return; } setSaving(true);
    try {
      const url = await uploadImageToSupabase(file);
      const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 10;
      await supabase.from("gallery_images").insert({ title: form.title || null, category: form.category || null, sort_order: form.sort_order || nextOrder, image_url: url });
      setForm(empty); setFile(null); showToast("Foto guardada"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nueva foto</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="border border-input rounded-lg p-2 bg-background">
            <input required type="file" accept="image/*" className="w-full text-sm" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          </div>
          <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={16} /> Subir</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 grid sm:grid-cols-3 gap-3">
        {items.map((g) => (
          <div key={g.id} className="relative group aspect-square bg-secondary rounded-xl overflow-hidden border">
            <img src={g.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
              <button onClick={async () => { const ok = await remove(g.id, confirm.ask); if (ok) showToast("Foto eliminada"); }} className="bg-destructive text-white p-2 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <confirm.Dialog />
    </div>
  );
}

// ---- SECCIÓN: GESTOR DE DONACIONES (DINÁMICO) ----
type DonationRow = { id: string; title: string; bank_name: string; account_number: string | null; cci: string | null; qr_image_url: string | null; description: string | null; sort_order: number };
function DonationsManager({ showToast }: { showToast: (m: string, t?: "success"|"error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<DonationRow>("donations_info", "sort_order", true);
  const empty = { title: "", bank_name: "Yape", account_number: "", cci: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<DonationRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadImageToSupabase = async (fileToUpload: File) => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
    const compressedFile = await imageCompression(fileToUpload, options);
    const fileExt = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `donaciones/${fileName}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(filePath, compressedFile);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('parroquia-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let qrUrl = null; if (file) qrUrl = await uploadImageToSupabase(file);
      const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 10;
      const { error } = await supabase.from("donations_info").insert({
        title: form.title, bank_name: form.bank_name,
        account_number: form.account_number || null, cci: form.cci || null,
        description: form.description || null, qr_image_url: qrUrl,
        sort_order: form.sort_order || nextOrder
      });
      if (error) throw error;
      setForm(empty); setFile(null); showToast("Canal de donación creado"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try {
      let finalUrl = editing.qr_image_url; if (file) finalUrl = await uploadImageToSupabase(file);
      const { error } = await supabase.from("donations_info").update({
        title: editing.title, bank_name: editing.bank_name,
        account_number: editing.account_number || null, cci: editing.cci || null,
        description: editing.description || null, qr_image_url: finalUrl,
        sort_order: editing.sort_order
      }).eq("id", editing.id);
      if (error) throw error;
      setEditing(null); setFile(null); showToast("Actualizado con éxito"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo canal</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input required placeholder="Título (ej: Colecta del Templo, Diezmo)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none">
            <option value="Yape">Yape</option><option value="Plin">Plin</option>
            <option value="BCP">BCP</option><option value="Interbank">Interbank</option>
            <option value="BBVA">BBVA</option><option value="Scotiabank">Scotiabank</option>
          </select>
          {(form.bank_name !== "Yape" && form.bank_name !== "Plin") ? (
            <>
              <Input placeholder="Número de cuenta" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
              <Input placeholder="CCI" value={form.cci} onChange={(e) => setForm({ ...form, cci: e.target.value })} />
            </>
          ) : (
            <div className="border border-input rounded-lg p-2 bg-background">
              <p className="text-xs text-muted-foreground mb-1">Subir QR de Yape/Plin:</p>
              <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            </div>
          )}
          <Textarea placeholder="Descripción corta" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={16} /> Guardar</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {items.map((d) => (
          <div key={d.id} className="bg-card rounded-xl p-5 border border-border flex gap-4 shadow-sm items-start">
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border overflow-hidden shrink-0">
              {d.qr_image_url ? <img src={d.qr_image_url} alt="" className="w-full h-full object-cover" /> : <Heart className="text-gold" size={20} fill="currentColor"/>}
            </div>
            <div className="flex-1 min-w-0 mt-0.5">
              <span className="text-[10px] uppercase font-bold text-gold">{d.bank_name}</span>
              <p className="font-display text-base font-semibold text-primary leading-tight">{d.title}</p>
              {d.account_number && <p className="text-xs font-mono text-muted-foreground mt-1">N°: {d.account_number}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(d); setFile(null); }} className="text-primary p-2 hover:bg-secondary rounded-lg"><Pencil size={16}/></button>
              <button onClick={async () => { const ok = await remove(d.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="text-destructive p-2 hover:bg-destructive/10 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar canal">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <select value={editing.bank_name} onChange={(e) => setEditing({ ...editing, bank_name: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm">
              <option value="Yape">Yape</option><option value="Plin">Plin</option><option value="BCP">BCP</option><option value="Interbank">Interbank</option>
            </select>
            {(editing.bank_name !== "Yape" && editing.bank_name !== "Plin") ? (
              <>
                <Input placeholder="Cuenta" value={editing.account_number ?? ""} onChange={(e) => setEditing({ ...editing, account_number: e.target.value })} />
                <Input placeholder="CCI" value={editing.cci ?? ""} onChange={(e) => setEditing({ ...editing, cci: e.target.value })} />
              </>
            ) : (
              <input type="file" accept="image/*" className="w-full text-sm border p-2 rounded-lg" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            )}
            <PrimaryBtn type="submit" disabled={saving}><Save size={16}/> Guardar</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}
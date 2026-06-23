import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, Plus, Trash2, Pencil, X, Calendar, Clock,
  Users, Image as ImageIcon, Save, AlertCircle, CheckCircle2, Heart,
  LayoutDashboard, ChevronRight, Zap
} from "lucide-react";
import imageCompression from 'browser-image-compression';
import { AttendanceScanner } from "@/routes/admin/AttendanceScanner";
import { EventsManager } from "@/routes/admin/EventsManager";
import { SecretariaDashboard } from "@/routes/admin/SecretariaDashboard";
export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Panel administrador · Parroquia" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

type Tab = "events" | "schedules" | "ministries" | "gallery" | "donations" | "attendance";

const tabs: { id: Tab; label: string; icon: typeof Calendar; description: string; color: string }[] = [
  { id: "events",     label: "Eventos",     icon: Calendar,       description: "Publicar y editar",  color: "text-blue-500"   },
  { id: "schedules",  label: "Horarios",    icon: Clock,          description: "Misas y servicios",  color: "text-amber-500"  },
  { id: "ministries", label: "Ministerios", icon: Users,          description: "Grupos y líderes",   color: "text-purple-500" },
  { id: "gallery",    label: "Galería",     icon: ImageIcon,      description: "Fotos del templo",   color: "text-green-500"  },
  { id: "donations",  label: "Donaciones",  icon: Heart,          description: "Canales de pago",    color: "text-rose-500"   },
  { id: "attendance", label: "Asistencia",  icon: Zap,            description: "Registro QR",        color: "text-gold"       },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "editor" | "secretaria" | null>(null); 
  const [tab, setTab] = useState<Tab>("events");
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate({ to: "/admin/login" }); return; }

      const metaName = data.session.user.user_metadata?.full_name;
      setUserName(metaName ? metaName.toUpperCase() : (data.session.user.email ?? ""));

      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);

      const rolesList = roles?.map(r => r.role) || [];
      if (rolesList.includes("admin"))       { setUserRole("admin");  setTab("events"); }
      else if (rolesList.includes("secretaria")) { setUserRole("secretaria"); } // <- NUEVA LÍNEA
      else if (rolesList.includes("editor")) { setUserRole("editor"); setTab("attendance"); }
      else                                   { setUserRole(null); }
      setReady(true);
    })();
  }, [navigate]);

  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  if (!ready) return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando panel…</p>
      </div>
    </div>
  );

  if (!userRole) return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center p-6">
      <div className="max-w-md bg-card rounded-2xl p-8 shadow-card border border-border text-center">
        <h1 className="font-display text-2xl text-primary">Acceso restringido</h1>
        <p className="mt-3 text-sm text-muted-foreground">Tu cuenta no tiene un rol autorizado en el sistema.</p>
        <button onClick={logout} className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Cerrar sesión</button>
      </div>
    </div>
  );
  if (userRole === "secretaria") {
    return <SecretariaDashboard userName={userName} logout={logout} />;
  }
  const tabsToShow = userRole === "admin" ? tabs : tabs.filter(t => t.id === "attendance");
  const activeTab = tabs.find(t => t.id === tab);

  return (
    <div className="min-h-screen bg-[#f5f3ef] relative">

      {/* ── HEADER ── */}
      <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/assets/logo.png" alt="" className="h-9 w-9" />
            <div className="leading-tight hidden sm:block">
              <p className="font-display text-sm text-primary font-semibold">
                {userRole === "admin" ? "Panel Administrador" : "Panel de Asistencia"}
              </p>
              <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Parroquia Santísima Trinidad</p>
            </div>
          </Link>

          {/* Breadcrumb activo */}
          {activeTab && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 justify-center sm:justify-start sm:ml-6">
              <LayoutDashboard size={12} />
              <ChevronRight size={10} />
              <span className={`font-semibold ${activeTab.color}`}>{activeTab.label}</span>
              <span className="hidden sm:inline text-muted-foreground/60">— {activeTab.description}</span>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-bold text-primary tracking-wider leading-none">{userName}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{userRole}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-border transition-colors">
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-4rem)]">

        {/* ── SIDEBAR (admin) / NAV superior (editor) ── */}
        {userRole === "admin" ? (
          <aside className="w-52 shrink-0 hidden lg:flex flex-col py-6 px-3 border-r border-border/60 bg-card/60 gap-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-3 mb-3">Secciones</p>
            {tabsToShow.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}>
                  <Icon size={16} className={active ? "text-gold" : t.color} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none mb-0.5">{t.label}</p>
                    <p className={`text-[10px] leading-none truncate ${active ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}>{t.description}</p>
                  </div>
                </button>
              );
            })}
          </aside>
        ) : null}

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Nav horizontal solo en mobile (admin) o siempre (editor) */}
          {(userRole === "editor" || true) && (
            <nav className={`${userRole === "admin" ? "lg:hidden" : ""} flex gap-1 overflow-x-auto px-4 pt-3 pb-0 bg-card border-b border-border`}>
              {tabsToShow.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                      active ? "border-gold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}>
                    <Icon size={13} className={active ? t.color : ""} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          )}

          <main className="flex-1 p-5 lg:p-8">
            {/* Título de sección con estilo */}
            {activeTab && (
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm`}>
                  <activeTab.icon size={18} className={activeTab.color} />
                </div>
                <div>
                  <h1 className="font-display text-xl text-primary leading-none">{activeTab.label}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeTab.description}</p>
                </div>
              </div>
            )}

            {tab === "events"     && userRole === "admin" && <EventsManager showToast={showToast} />}
            {tab === "schedules"  && userRole === "admin" && <SchedulesManager showToast={showToast} />}
            {tab === "ministries" && userRole === "admin" && <MinistriesManager showToast={showToast} />}
            {tab === "gallery"    && userRole === "admin" && <GalleryManager showToast={showToast} />}
            {tab === "donations"  && userRole === "admin" && <DonationsManager showToast={showToast} />}
            {tab === "attendance" && <AttendanceScanner />}
          </main>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-4 bg-card border border-border">
          {toast.type === "success"
            ? <CheckCircle2 className="text-green-500 shrink-0" size={18} />
            : <AlertCircle   className="text-destructive shrink-0" size={18} />}
          <span className="text-sm font-medium text-foreground">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
//  AUXILIARES COMPARTIDOS
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

// ── Confirm dialog ──
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

// ── useTable ──
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

// ── EditModal ──
function EditModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg my-8 animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display text-xl text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  SECCIÓN: HORARIOS
// ────────────────────────────────────────────────
type ScheduleRow = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
function SchedulesManager({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<ScheduleRow>("schedules", "sort_order", true);
  const empty = { category: "misa", day_label: "", time_label: "", notes: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<ScheduleRow | null>(null);

  const categoryColors: Record<string, string> = {
    misa: "bg-amber-50 text-amber-700 border-amber-200",
    confesion: "bg-purple-50 text-purple-700 border-purple-200",
    catequesis: "bg-blue-50 text-blue-700 border-blue-200",
    adoracion: "bg-rose-50 text-rose-700 border-rose-200",
    pastoral: "bg-green-50 text-green-700 border-green-200",
    secretaria: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextOrder = items.length ? Math.max(...items.map(i => i.sort_order)) + 10 : 10;
    const { error } = await supabase.from("schedules").insert({ ...form, sort_order: form.sort_order || nextOrder });
    if (error) { showToast(error.message, "error"); return; }
    setForm(empty); showToast("Horario creado"); load();
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const { error } = await supabase.from("schedules").update({
      category: editing.category, day_label: editing.day_label,
      time_label: editing.time_label, notes: editing.notes, sort_order: editing.sort_order,
    }).eq("id", editing.id);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(null); showToast("Horario actualizado"); load();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-lg text-primary mb-1">Nuevo horario</h2>
        <p className="text-xs text-muted-foreground mb-4">Visible en la sección de horarios.</p>
        <form onSubmit={submit} className="space-y-3">
          <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
            <option value="misa">Santa Misa</option>
            <option value="confesion">Confesiones</option>
            <option value="catequesis">Catequesis</option>
            <option value="adoracion">Adoración</option>
            <option value="pastoral">Pastoral</option>
            <option value="secretaria">Secretaría</option>
          </select>
          <Input required placeholder="Día (ej: Domingos)" value={form.day_label} onChange={e => setForm({ ...form, day_label: e.target.value })} />
          <Input required placeholder="Hora (ej: 10:00 AM)" value={form.time_label} onChange={e => setForm({ ...form, time_label: e.target.value })} />
          <Input placeholder="Nota (opcional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <PrimaryBtn type="submit"><Plus size={15} /> Agregar horario</PrimaryBtn>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-2">
        {items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm">
            Sin horarios — agrega el primero.
          </div>
        )}
        {items.map(s => (
          <div key={s.id} className="bg-card rounded-xl px-4 py-3 border border-border flex items-center justify-between gap-4 shadow-sm hover:border-gold/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${categoryColors[s.category] ?? "bg-secondary text-primary border-border"}`}>
                {s.category}
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">{s.day_label}</p>
                <p className="text-xs text-muted-foreground">{s.time_label}{s.notes ? ` · ${s.notes}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing({ ...s, notes: s.notes ?? "" })}
                className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"><Pencil size={15} /></button>
              <button onClick={async () => { const ok = await remove(s.id, confirm.ask); if (ok) showToast("Eliminado"); }}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar horario">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Categoría</label>
              <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
                <option value="misa">Santa Misa</option>
                <option value="confesion">Confesiones</option>
                <option value="catequesis">Catequesis</option>
                <option value="adoracion">Adoración</option>
                <option value="pastoral">Pastoral</option>
                <option value="secretaria">Secretaría</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Día</label>
              <Input required value={editing.day_label} onChange={e => setEditing({ ...editing, day_label: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Hora</label>
              <Input required value={editing.time_label} onChange={e => setEditing({ ...editing, time_label: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Nota (opcional)</label>
              <Input value={editing.notes ?? ""} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <PrimaryBtn type="submit"><Save size={15} /> Guardar cambios</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}

// ────────────────────────────────────────────────
//  SECCIÓN: MINISTERIOS
// ────────────────────────────────────────────────
type MinistryRow = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
function MinistriesManager({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<MinistryRow>("ministries", "created_at", true);
  const empty = { name: "", description: "", leader: "", schedule: "", image_url: "" };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<MinistryRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadImage = async (f: File) => {
    const compressed = await imageCompression(f, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true });
    const path = `ministerios/${Math.random()}.${compressed.name.split('.').pop() || 'jpg'}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(path, compressed);
    if (error) throw error;
    return supabase.storage.from('parroquia-images').getPublicUrl(path).data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = file ? await uploadImage(file) : null;
      const { error } = await supabase.from("ministries").insert({ name: form.name, description: form.description || null, leader: form.leader || null, schedule: form.schedule || null, image_url: url });
      if (error) throw error;
      setForm(empty); setFile(null); showToast("Ministerio agregado"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try {
      const finalUrl = file ? await uploadImage(file) : editing.image_url;
      const { error } = await supabase.from("ministries").update({ name: editing.name, description: editing.description || null, leader: editing.leader || null, schedule: editing.schedule || null, image_url: finalUrl }).eq("id", editing.id);
      if (error) throw error;
      setEditing(null); setFile(null); showToast("Ministerio actualizado"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-lg text-primary mb-1">Nuevo ministerio</h2>
        <p className="text-xs text-muted-foreground mb-4">Grupo o comunidad parroquial.</p>
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Nombre del ministerio" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Encargado" value={form.leader} onChange={e => setForm({ ...form, leader: e.target.value })} />
          <div className="border border-input rounded-lg p-2.5 bg-background">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 tracking-wide">Foto</p>
            <input type="file" accept="image/*" className="w-full text-xs text-muted-foreground" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          </div>
          <Textarea placeholder="Descripción breve…" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={15} /> {saving ? "Guardando…" : "Agregar"}</PrimaryBtn>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {items.map(m => (
          <div key={m.id} className="bg-card rounded-xl p-4 border border-border flex gap-4 items-center shadow-sm hover:border-gold/40 transition-colors">
            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary flex items-center justify-center border">
              {m.image_url ? <img src={m.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground/30" size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-primary">{m.name}</p>
              <p className="text-xs text-muted-foreground">{[m.leader, m.schedule].filter(Boolean).join(' · ')}</p>
              {m.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{m.description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(m); setFile(null); }} className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"><Pencil size={15} /></button>
              <button onClick={async () => { const ok = await remove(m.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar ministerio">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <Input placeholder="Encargado" value={editing.leader ?? ""} onChange={e => setEditing({ ...editing, leader: e.target.value })} />
            <input type="file" accept="image/*" className="w-full text-xs border p-2 rounded-lg" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            <Textarea rows={3} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <PrimaryBtn type="submit" disabled={saving}><Save size={15} /> Guardar cambios</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}

// ────────────────────────────────────────────────
//  SECCIÓN: GALERÍA (CON PAGINACIÓN)
// ────────────────────────────────────────────────
type GalleryRow = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };
function GalleryManager({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<GalleryRow>("gallery_images", "sort_order", true);
  const empty = { title: "", category: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Asegurar que si borramos el último ítem de una página, regresemos a la anterior
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, currentPage, totalPages]);

  const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uploadImage = async (f: File) => {
    const compressed = await imageCompression(f, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true });
    const path = `galeria/${Math.random()}.${compressed.name.split('.').pop() || 'jpg'}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(path, compressed);
    if (error) throw error;
    return supabase.storage.from('parroquia-images').getPublicUrl(path).data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file) { showToast("Selecciona una foto", "error"); return; } setSaving(true);
    try {
      const url = await uploadImage(file);
      const nextOrder = items.length ? Math.max(...items.map(i => i.sort_order)) + 10 : 10;
      await supabase.from("gallery_images").insert({ title: form.title || null, category: form.category || null, sort_order: nextOrder, image_url: url });
      setForm(empty); setFile(null); showToast("Foto publicada"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try {
      let finalUrl = editing.image_url;
      if (file) finalUrl = await uploadImage(file);
      const { error } = await supabase.from("gallery_images").update({
        title: editing.title || null,
        category: editing.category || null,
        image_url: finalUrl,
      }).eq("id", editing.id);
      if (error) throw error;
      setEditing(null); setFile(null); showToast("Foto actualizada"); load();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-lg text-primary mb-1">Subir foto</h2>
        <p className="text-xs text-muted-foreground mb-4">Se comprime automáticamente.</p>
        <form onSubmit={submit} className="space-y-3">
          <div className="border-2 border-dashed border-input rounded-xl p-4 bg-background text-center">
            <input required type="file" accept="image/*" className="w-full text-xs text-muted-foreground" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            {file && <p className="text-xs text-green-600 mt-1.5 font-medium">✓ {file.name}</p>}
          </div>
          <Input placeholder="Título (opcional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Categoría (opcional)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={15} /> {saving ? "Subiendo…" : "Publicar foto"}</PrimaryBtn>
        </form>
      </Card>

      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Grilla de imágenes paginadas */}
        <div className="grid sm:grid-cols-3 gap-3">
          {currentItems.map(g => (
            <div key={g.id} className="relative group aspect-square bg-secondary rounded-xl overflow-hidden border border-border">
              <img src={g.image_url} alt={g.title ?? ""} className="w-full h-full object-cover" />
              {g.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 p-2">
                  <p className="text-white text-[10px] font-medium truncate">{g.title}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <button onClick={() => { setEditing(g); setFile(null); }}
                  className="bg-white text-primary p-2 rounded-lg shadow hover:bg-secondary transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={async () => { const ok = await remove(g.id, confirm.ask); if (ok) showToast("Foto eliminada"); }}
                  className="bg-destructive text-white p-2 rounded-lg shadow">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      <EditModal open={!!editing} onClose={() => { setEditing(null); setFile(null); }} title="Editar foto">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
              <img src={editing.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Reemplazar imagen (opcional)</label>
              <div className="border border-input rounded-lg p-2.5 bg-background">
                <input type="file" accept="image/*" className="w-full text-xs"
                  onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                {file && <p className="text-xs text-green-600 mt-1 font-medium">✓ {file.name}</p>}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Título</label>
              <Input placeholder="Título (opcional)" value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Categoría</label>
              <Input placeholder="Categoría (opcional)" value={editing.category ?? ""} onChange={e => setEditing({ ...editing, category: e.target.value })} />
            </div>
            <PrimaryBtn type="submit" disabled={saving}><Save size={15} /> {saving ? "Guardando…" : "Guardar cambios"}</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}

// ────────────────────────────────────────────────
//  SECCIÓN: DONACIONES
// ────────────────────────────────────────────────
type DonationRow = { id: string; title: string; bank_name: string; account_number: string | null; cci: string | null; qr_image_url: string | null; description: string | null; sort_order: number };
function DonationsManager({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const confirm = useConfirm();
  const { items, load, remove } = useTable<DonationRow>("donations_info", "sort_order", true);
  const empty = { title: "", bank_name: "Yape", account_number: "", cci: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<DonationRow | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadImage = async (f: File) => {
    const compressed = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true });
    const path = `donaciones/${Math.random()}.${compressed.name.split('.').pop() || 'jpg'}`;
    const { error } = await supabase.storage.from('parroquia-images').upload(path, compressed);
    if (error) throw error;
    return supabase.storage.from('parroquia-images').getPublicUrl(path).data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const qrUrl = file ? await uploadImage(file) : null;
      const nextOrder = items.length ? Math.max(...items.map(i => i.sort_order)) + 10 : 10;
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
      const finalUrl = file ? await uploadImage(file) : editing.qr_image_url;
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

  const bankColor: Record<string, string> = {
    Yape: "bg-purple-50 text-purple-700 border-purple-200",
    Plin: "bg-green-50 text-green-700 border-green-200",
    BCP: "bg-blue-50 text-blue-700 border-blue-200",
    Interbank: "bg-emerald-50 text-emerald-700 border-emerald-200",
    BBVA: "bg-sky-50 text-sky-700 border-sky-200",
    Scotiabank: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-lg text-primary mb-1">Nuevo canal</h2>
        <p className="text-xs text-muted-foreground mb-4">Yape, Plin o cuenta bancaria.</p>
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Título (ej: Colecta del Templo)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <select required value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
            <option value="Yape">Yape</option><option value="Plin">Plin</option>
            <option value="BCP">BCP</option><option value="Interbank">Interbank</option>
            <option value="BBVA">BBVA</option><option value="Scotiabank">Scotiabank</option>
          </select>
          {(form.bank_name !== "Yape" && form.bank_name !== "Plin") ? (
            <>
              <Input placeholder="Número de cuenta" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} />
              <Input placeholder="CCI" value={form.cci} onChange={e => setForm({ ...form, cci: e.target.value })} />
            </>
          ) : (
            <div className="border-2 border-dashed border-input rounded-xl p-3 bg-background">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 tracking-wide">QR de {form.bank_name}</p>
              <input type="file" accept="image/*" className="w-full text-xs" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            </div>
          )}
          <Textarea placeholder="Descripción corta (opcional)" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit" disabled={saving}><Plus size={15} /> {saving ? "Guardando…" : "Guardar canal"}</PrimaryBtn>
        </form>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm">
            Sin canales aún — agrega el primero.
          </div>
        )}
        {items.map(d => (
          <div key={d.id} className="bg-card rounded-xl p-4 border border-border flex gap-4 items-center shadow-sm hover:border-gold/40 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center border overflow-hidden shrink-0">
              {d.qr_image_url ? <img src={d.qr_image_url} alt="" className="w-full h-full object-cover" /> : <Heart className="text-rose-400" size={20} fill="currentColor" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${bankColor[d.bank_name] ?? "bg-secondary text-primary border-border"}`}>
                  {d.bank_name}
                </span>
              </div>
              <p className="font-semibold text-sm text-primary">{d.title}</p>
              {d.account_number && <p className="text-xs font-mono text-muted-foreground">N°: {d.account_number}</p>}
              {d.description && <p className="text-xs text-muted-foreground/70 line-clamp-1">{d.description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(d); setFile(null); }} className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"><Pencil size={15} /></button>
              <button onClick={async () => { const ok = await remove(d.id, confirm.ask); if (ok) showToast("Eliminado"); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <EditModal open={!!editing} onClose={() => setEditing(null)} title="Editar canal">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3">
            <Input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <select value={editing.bank_name} onChange={e => setEditing({ ...editing, bank_name: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm outline-none focus:border-gold">
              <option value="Yape">Yape</option><option value="Plin">Plin</option>
              <option value="BCP">BCP</option><option value="Interbank">Interbank</option>
            </select>
            {(editing.bank_name !== "Yape" && editing.bank_name !== "Plin") ? (
              <>
                <Input placeholder="Cuenta" value={editing.account_number ?? ""} onChange={e => setEditing({ ...editing, account_number: e.target.value })} />
                <Input placeholder="CCI" value={editing.cci ?? ""} onChange={e => setEditing({ ...editing, cci: e.target.value })} />
              </>
            ) : (
              <input type="file" accept="image/*" className="w-full text-xs border p-2 rounded-lg" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            )}
            <PrimaryBtn type="submit" disabled={saving}><Save size={15} /> Guardar cambios</PrimaryBtn>
          </form>
        )}
      </EditModal>
      <confirm.Dialog />
    </div>
  );
}
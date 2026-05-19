import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Trash2, Newspaper, Calendar, Clock, Users, Image as ImageIcon } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Panel administrador · Parroquia" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

type Tab = "news" | "events" | "schedules" | "ministries" | "gallery";

const tabs: { id: Tab; label: string; icon: typeof Newspaper }[] = [
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "schedules", label: "Horarios", icon: Clock },
  { id: "ministries", label: "Ministerios", icon: Users },
  { id: "gallery", label: "Galería", icon: ImageIcon },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("news");

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
            Pide a un administrador que ejecute en la base de datos:
          </p>
          <pre className="mt-4 text-xs bg-secondary p-3 rounded-lg overflow-auto text-left">
            {`INSERT INTO user_roles (user_id, role)\nSELECT id, 'admin' FROM auth.users\nWHERE email = '${email}';`}
          </pre>
          <button onClick={logout} className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-9 w-9" />
            <div className="leading-tight">
              <p className="font-display text-base text-primary">Panel administrador</p>
              <p className="text-[11px] text-muted-foreground">Parroquia Santísima Trinidad</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
            <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5 hover:bg-border">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                  tab === t.id ? "border-gold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-5 lg:p-8">
        {tab === "news" && <NewsManager />}
        {tab === "events" && <EventsManager />}
        {tab === "schedules" && <SchedulesManager />}
        {tab === "ministries" && <MinistriesManager />}
        {tab === "gallery" && <GalleryManager />}
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card rounded-2xl shadow-card border border-border p-6">{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2.5 rounded-lg border border-input bg-background outline-none focus:border-gold text-sm ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full px-3 py-2.5 rounded-lg border border-input bg-background outline-none focus:border-gold text-sm resize-none ${props.className ?? ""}`} />;
}
function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="px-4 py-2.5 rounded-lg bg-gradient-gold text-primary font-semibold text-sm hover:shadow-card disabled:opacity-50 flex items-center gap-1.5 transition" />;
}

function useTable<T extends { id: string }>(table: string, orderBy: string, ascending = false) {
  const [items, setItems] = useState<T[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table as never).select("*").order(orderBy, { ascending });
    if (data) setItems(data as T[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await supabase.from(table as never).delete().eq("id", id);
    load();
  };
  return { items, load, remove };
}

function NewsManager() {
  const { items, load, remove } = useTable<{ id: string; title: string; excerpt: string | null; content: string; image_url: string | null; published_at: string }>("news", "published_at");
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", image_url: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("news").insert({ ...form, image_url: form.image_url || null });
    setForm({ title: "", excerpt: "", content: "", image_url: "" });
    load();
  };
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <h2 className="font-display text-xl text-primary">Nueva noticia</h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Input required placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="URL de imagen (opcional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Textarea placeholder="Resumen breve" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <Textarea required placeholder="Contenido completo" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <PrimaryBtn type="submit"><Plus size={16} /> Publicar</PrimaryBtn>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-3">
        {items.map((n) => (
          <div key={n.id} className="bg-card rounded-xl p-5 border border-border flex gap-4">
            {n.image_url && <img src={n.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" />}
            <div className="flex-1">
              <p className="text-xs text-gold uppercase tracking-widest">{new Date(n.published_at).toLocaleDateString("es-PE")}</p>
              <p className="font-display text-lg text-primary">{n.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{n.excerpt}</p>
            </div>
            <button onClick={() => remove(n.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg h-fit"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsManager() {
  const { items, load, remove } = useTable<{ id: string; title: string; description: string | null; event_date: string; location: string | null }>("events", "event_date", true);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("events").insert({ ...form, event_date: new Date(form.event_date).toISOString() });
    setForm({ title: "", description: "", event_date: "", location: "" });
    load();
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
          <div key={e.id} className="bg-card rounded-xl p-5 border border-border flex justify-between gap-3">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest">{new Date(e.event_date).toLocaleString("es-PE")}</p>
              <p className="font-display text-lg text-primary">{e.title}</p>
              {e.location && <p className="text-xs text-muted-foreground mt-1">📍 {e.location}</p>}
              <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
            </div>
            <button onClick={() => remove(e.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg h-fit"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulesManager() {
  const { items, load, remove } = useTable<{ id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number }>("schedules", "sort_order", true);
  const [form, setForm] = useState({ category: "misa", day_label: "", time_label: "", notes: "", sort_order: 0 });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("schedules").insert(form);
    setForm({ category: "misa", day_label: "", time_label: "", notes: "", sort_order: 0 });
    load();
  };
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo horario</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
            <option value="misa">Santa Misa</option>
            <option value="confesion">Confesiones</option>
            <option value="catequesis">Catequesis</option>
            <option value="adoracion">Adoración</option>
            <option value="pastoral">Pastoral</option>
          </select>
          <Input required placeholder="Día (ej: Domingos)" value={form.day_label} onChange={(e) => setForm({ ...form, day_label: e.target.value })} />
          <Input required placeholder="Hora (ej: 10:00 AM)" value={form.time_label} onChange={(e) => setForm({ ...form, time_label: e.target.value })} />
          <Input placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <PrimaryBtn type="submit"><Plus size={16} /> Agregar</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-2">
        {items.map((s) => (
          <div key={s.id} className="bg-card rounded-xl p-4 border border-border flex justify-between items-center">
            <div className="flex-1">
              <p className="text-xs text-gold uppercase">{s.category}</p>
              <p className="text-sm font-semibold">{s.day_label} · <span className="text-muted-foreground">{s.time_label}</span></p>
              {s.notes && <p className="text-xs text-muted-foreground italic">{s.notes}</p>}
            </div>
            <button onClick={() => remove(s.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinistriesManager() {
  const { items, load, remove } = useTable<{ id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null }>("ministries", "created_at", true);
  const [form, setForm] = useState({ name: "", description: "", leader: "", schedule: "", image_url: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("ministries").insert({ ...form, image_url: form.image_url || null });
    setForm({ name: "", description: "", leader: "", schedule: "", image_url: "" });
    load();
  };
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nuevo ministerio</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Encargado" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} />
          <Input placeholder="Horario" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
          <Input placeholder="URL de imagen" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Textarea placeholder="Descripción" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <PrimaryBtn type="submit"><Plus size={16} /> Agregar</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {items.map((m) => (
          <div key={m.id} className="bg-card rounded-xl p-5 border border-border flex justify-between gap-3">
            <div>
              <p className="font-display text-lg text-primary">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.leader} · {m.schedule}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
            </div>
            <button onClick={() => remove(m.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg h-fit"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryManager() {
  const { items, load, remove } = useTable<{ id: string; title: string | null; category: string | null; image_url: string; sort_order: number }>("gallery_images", "sort_order", true);
  const [form, setForm] = useState({ title: "", category: "", image_url: "", sort_order: 0 });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("gallery_images").insert(form);
    setForm({ title: "", category: "", image_url: "", sort_order: 0 });
    load();
  };
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <h2 className="font-display text-xl text-primary">Nueva imagen</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input required placeholder="URL de imagen" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Categoría (misas, procesiones…)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <PrimaryBtn type="submit"><Plus size={16} /> Subir</PrimaryBtn>
        </form>
      </Card>
      <div className="lg:col-span-2 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((g) => (
          <div key={g.id} className="relative group rounded-xl overflow-hidden border border-border aspect-square">
            <img src={g.image_url} alt={g.title ?? ""} className="w-full h-full object-cover" />
            <button onClick={() => remove(g.id)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

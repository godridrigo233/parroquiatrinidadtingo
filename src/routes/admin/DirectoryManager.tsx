import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Loader2, Search, FileSpreadsheet, Pencil, X, Check, Users } from "lucide-react";
import * as XLSX from "xlsx";

type Catechist = {
  id: string;
  full_name: string;
  code: string;
  dni: string | null;
  created_at?: string | null;
};

export function DirectoryManager({ showToast }: { showToast?: (msg: string, type?: "success" | "error") => void }) {
  const notify = (msg: string, type: "success" | "error" = "success") =>
    showToast ? showToast(msg, type) : (type === "error" ? alert(msg) : undefined);

  const [catechists, setCatechists] = useState<Catechist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const emptyForm = { full_name: "", code: "", dni: "" };
  const [form, setForm] = useState(emptyForm);

  // Edición en línea
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => { fetchCatechists(); }, []);

  const fetchCatechists = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("catechists").select("*").order("full_name");
    if (error) notify("Error al cargar: " + error.message, "error");
    if (data) setCatechists(data as Catechist[]);
    setLoading(false);
  };

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("catechists").insert({
      full_name: form.full_name.trim().toUpperCase(),
      code: form.code.trim().toUpperCase(),
      dni: form.dni.trim() || null,
    });
    setSaving(false);
    if (error) { notify("Error: " + error.message, "error"); return; }
    setForm(emptyForm);
    notify("Catequista registrado");
    fetchCatechists();
  };

  const eliminar = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Borrar a ${nombre}?`)) return;
    const { error } = await supabase.from("catechists").delete().eq("id", id);
    if (error) { notify("Error al borrar: " + error.message, "error"); return; }
    notify("Catequista eliminado");
    fetchCatechists();
  };

  const empezarEdicion = (c: Catechist) => {
    setEditId(c.id);
    setEditForm({ full_name: c.full_name, code: c.code, dni: c.dni ?? "" });
  };

  const guardarEdicion = async (id: string) => {
    const { error } = await supabase.from("catechists").update({
      full_name: editForm.full_name.trim().toUpperCase(),
      code: editForm.code.trim().toUpperCase(),
      dni: editForm.dni.trim() || null,
    }).eq("id", id);
    if (error) { notify("Error al actualizar: " + error.message, "error"); return; }
    setEditId(null);
    notify("Cambios guardados");
    fetchCatechists();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catechists;
    return catechists.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.dni ?? "").includes(q)
    );
  }, [catechists, query]);

  const exportarExcel = () => {
    if (catechists.length === 0) { notify("No hay datos para exportar", "error"); return; }
    const datos = catechists.map((c, i) => ({
      "N°": i + 1,
      "Código": c.code,
      "Nombre Completo": c.full_name,
      "DNI": c.dni ?? "",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 34 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Catequistas");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Directorio_Catequistas_${fecha}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* FORMULARIO NUEVO */}
      <form onSubmit={agregar} className="bg-card p-5 rounded-2xl border border-border shadow-card">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-primary"><UserPlus size={16} /> Nuevo Catequista</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input required placeholder="Nombre completo" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
          <input required placeholder="Código (CAT-00)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
          <input placeholder="DNI (opcional)" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} maxLength={8} inputMode="numeric" className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
        </div>
        <button type="submit" disabled={saving} className="w-full mt-3 py-2.5 bg-gradient-gold text-primary rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:shadow-card">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} REGISTRAR
        </button>
      </form>

      {/* BARRA: BÚSQUEDA + CONTADOR + EXPORTAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Buscar por nombre, código o DNI…" value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <Users size={14} /> {filtered.length} de {catechists.length}
        </div>
        <button onClick={exportarExcel} className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shrink-0 transition-colors">
          <FileSpreadsheet size={16} /> Exportar Excel
        </button>
      </div>

      {/* LISTA */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {catechists.length === 0 ? "No hay catequistas registrados aún." : "Sin resultados para tu búsqueda."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(c => (
              <div key={c.id} className="p-3 flex justify-between items-center gap-3 hover:bg-secondary/40 transition-colors">
                {editId === c.id ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="px-2 py-1.5 rounded-md border border-input bg-background text-xs outline-none focus:border-gold" />
                      <input value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} className="px-2 py-1.5 rounded-md border border-input bg-background text-xs outline-none focus:border-gold" />
                      <input value={editForm.dni} onChange={e => setEditForm({ ...editForm, dni: e.target.value })} maxLength={8} className="px-2 py-1.5 rounded-md border border-input bg-background text-xs outline-none focus:border-gold" />
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => guardarEdicion(c.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                      <button onClick={() => setEditId(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X size={16} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{c.full_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{c.code}{c.dni ? ` • DNI: ${c.dni}` : ""}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => empezarEdicion(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={15} /></button>
                      <button onClick={() => eliminar(c.id, c.full_name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

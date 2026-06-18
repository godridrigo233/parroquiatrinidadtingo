import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Loader2 } from "lucide-react";

export function DirectoryManager() {
  const [catechists, setCatechists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoDni, setNuevoDni] = useState("");

  useEffect(() => { fetchCatechists(); }, []);

  const fetchCatechists = async () => {
    setLoading(true);
    const { data } = await supabase.from("catechists").select("*").order("full_name");
    if (data) setCatechists(data);
    setLoading(false);
  };

  const agregarCatequista = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("catechists").insert({
      full_name: nuevoNombre.toUpperCase(),
      code: nuevoCodigo.toUpperCase(),
      dni: nuevoDni
    });
    if (error) alert("Error: " + error.message);
    else {
      setNuevoNombre(""); setNuevoCodigo(""); setNuevoDni("");
      fetchCatechists();
    }
  };

  const eliminarCatequista = async (id: string) => {
    if (!window.confirm("¿Borrar catequista?")) return;
    await supabase.from("catechists").delete().eq("id", id);
    fetchCatechists();
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <form onSubmit={agregarCatequista} className="bg-secondary/30 p-5 rounded-2xl border border-border">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><UserPlus size={16} /> Nuevo Catequista</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input required placeholder="Nombre" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="p-2 rounded-lg border text-sm" />
          <input required placeholder="Código (CAT-00)" value={nuevoCodigo} onChange={e => setNuevoCodigo(e.target.value)} className="p-2 rounded-lg border text-sm" />
          <input required placeholder="dni" value={nuevoDni} onChange={e => setNuevoDni(e.target.value)} maxLength={8} className="p-2 rounded-lg border text-sm" />
        </div>
        <button className="w-full mt-3 py-2 bg-primary text-white rounded-lg text-xs font-bold">REGISTRAR</button>
      </form>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {catechists.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No hay catequistas registrados aún.
          </div>
        ) : (
          catechists.map(c => (
            <div key={c.id} className="p-3 flex justify-between items-center border-b last:border-0">
              <div>
                <p className="text-sm font-semibold text-primary">{c.full_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{c.code} • DNI: {c.DNI}</p>
              </div>
              <button onClick={() => eliminarCatequista(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
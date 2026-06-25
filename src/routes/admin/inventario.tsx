import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Pencil, Trash2, X, Package, CheckCircle2, AlertCircle } from "lucide-react";

// Definimos la estructura de datos según tu tabla SQL
type InventoryItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  notes: string | null;
};

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estados para el Modal y Formularios
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para alertas (Toast)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const emptyForm = {
    name: "",
    category: "Litúrgico",
    status: "Disponible",
    quantity: 1,
    location: "",
    notes: ""
  };
  const [form, setForm] = useState(emptyForm);

  // 1. Cargar los datos desde Supabase
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) setItems(data);
    if (error) console.error("Error cargando inventario:", error);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 2. Guardar o Actualizar un activo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase.from("inventory_items").update(form).eq("id", editingId);
        if (error) throw error;
        showToast("Activo actualizado correctamente");
      } else {
        const { error } = await supabase.from("inventory_items").insert([form]);
        if (error) throw error;
        showToast("Activo registrado correctamente");
      }
      
      setIsModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchItems();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Eliminar un activo
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer.")) return;
    
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Activo eliminado", "success");
      fetchItems();
    }
  };

  // 4. Abrir modal para editar
  const handleEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      category: item.category,
      status: item.status,
      quantity: item.quantity,
      location: item.location,
      notes: item.notes || ""
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Lógica de filtrado en memoria (muy rápida)
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    "Disponible": "bg-green-100 text-green-700 border-green-200",
    "En uso": "bg-blue-100 text-blue-700 border-blue-200",
    "En reparación": "bg-amber-100 text-amber-700 border-amber-200",
    "Baja": "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Botón Nuevo */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display text-primary font-semibold">Control de Activos</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión de bienes y herramientas litúrgicas.</p>
        </div>
        <button 
          onClick={() => { setForm(emptyForm); setEditingId(null); setIsModalOpen(true); }}
          className="bg-gradient-gold text-primary font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Registrar Activo
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ubicación..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-gold transition-colors shadow-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-gold transition-colors shadow-sm"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="En uso">En uso</option>
          <option value="En reparación">En reparación</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {/* Tabla/Lista de Activos */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center text-muted-foreground">
            <Package size={48} className="mb-4 opacity-20" />
            <p>No se encontraron activos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Activo</th>
                  <th className="px-6 py-4 font-medium">Ubicación</th>
                  <th className="px-6 py-4 font-medium text-center">Cant.</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.location}</td>
                    <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-elegant animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display text-xl text-primary">{editingId ? "Editar Activo" : "Nuevo Activo"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Nombre del activo</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm" placeholder="Ej: Cáliz de plata" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Categoría</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm">
                    <option value="Litúrgico">Litúrgico</option>
                    <option value="Audio/Video">Audio/Video</option>
                    <option value="Ornamentos">Ornamentos</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Cantidad</label>
                  <input required type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm">
                    <option value="Disponible">Disponible</option>
                    <option value="En uso">En uso</option>
                    <option value="En reparación">En reparación</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Ubicación</label>
                  <input required type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm" placeholder="Ej: Sacristía" />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Notas (Opcional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm resize-none" placeholder="Detalles de condición..." />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSaving} className="w-full bg-gradient-gold text-primary font-bold py-2.5 rounded-lg hover:shadow-md transition-all disabled:opacity-50">
                  {isSaving ? "Guardando..." : "Guardar Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Componente Toast (Notificaciones) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-4 bg-card border border-border">
          {toast.type === "success" 
            ? <CheckCircle2 className="text-green-500 shrink-0" size={18} /> 
            : <AlertCircle className="text-destructive shrink-0" size={18} />
          }
          <span className="text-sm font-medium text-foreground">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Pencil, Trash2, X, Package, CheckCircle2, AlertCircle, ArrowRightLeft, History } from "lucide-react";

// Definimos la estructura de datos
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
  
  // Estados para CRUD de Activos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estados para el Motor Transaccional
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedItemForTx, setSelectedItemForTx] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const emptyForm = { name: "", category: "Litúrgico", status: "Disponible", quantity: 1, location: "", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const emptyTxForm = { type: "Salida", quantity: 1, responsible_person: "", notes: "" };
  const [txForm, setTxForm] = useState(emptyTxForm);

  // 1. Cargar el inventario
  const fetchItems = async () => {
    const { data, error } = await supabase.from("inventory_items").select("*").order("name", { ascending: true });
    if (data) setItems(data);
    if (error) showToast("Error cargando inventario", "error");
  };

  useEffect(() => { fetchItems(); }, []);

  // 2. Guardar/Actualizar Activo (CRUD Básico)
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
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
      setIsModalOpen(false); setForm(emptyForm); setEditingId(null); fetchItems();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally { setIsSaving(false); }
  };

  // 3. Eliminar Activo
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este activo? Se borrará también su historial de movimientos.")) return;
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) showToast(error.message, "error");
    else { showToast("Activo eliminado", "success"); fetchItems(); }
  };

  // 4. MOTOR TRANSACCIONAL: Procesar Movimiento
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForTx) return;
    setIsSaving(true);

    try {
      // Validaciones de lógica de negocio
      let newQuantity = selectedItemForTx.quantity;
      let newStatus = selectedItemForTx.status;

      if (txForm.type === "Salida") {
        if (txForm.quantity > selectedItemForTx.quantity) throw new Error(`Stock insuficiente. Solo hay ${selectedItemForTx.quantity} disponible(s).`);
        newQuantity -= txForm.quantity;
      } else if (txForm.type === "Entrada") {
        newQuantity += txForm.quantity;
        if (newStatus === "Baja") newStatus = "Disponible"; // Auto-recuperación de estado
      } else if (txForm.type === "Mantenimiento") {
        newStatus = "En reparación"; // Automatización de estado
      }

      // Obtener el ID del usuario que registra el movimiento para la auditoría
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      // OPERACIÓN ACID: 1. Registrar Transacción
      const { error: txError } = await supabase.from("inventory_transactions").insert({
        item_id: selectedItemForTx.id,
        type: txForm.type,
        quantity: txForm.quantity,
        responsible_person: txForm.responsible_person,
        notes: txForm.notes || null,
        created_by: session.user.id
      });
      if (txError) throw txError;

      // OPERACIÓN ACID: 2. Actualizar Stock y Estado del Activo
      const { error: itemError } = await supabase.from("inventory_items").update({ 
        quantity: newQuantity, 
        status: newStatus 
      }).eq("id", selectedItemForTx.id);
      
      if (itemError) throw itemError;

      showToast("Movimiento registrado y stock actualizado con éxito");
      setIsTxModalOpen(false);
      setTxForm(emptyTxForm);
      fetchItems();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.location.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Cabecera */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display text-primary font-semibold">Inventario Parroquial</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión de bienes y herramientas litúrgicas.</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setIsModalOpen(true); }}
          className="bg-gradient-gold text-primary font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
          <Plus size={18} /> Nuevo Activo
        </button>
      </div>

      {/* Filtros */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input type="text" placeholder="Buscar activo o ubicación..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-gold transition-colors shadow-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-gold transition-colors shadow-sm">
          <option value="Todos">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="En uso">En uso</option>
          <option value="En reparación">En reparación</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {/* Tabla */}
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
                  <th className="px-6 py-4 font-medium text-center">Stock</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Transacciones / Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.location}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-lg text-primary">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setSelectedItemForTx(item); setIsTxModalOpen(true); }}
                        title="Registrar Movimiento"
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1.5 font-medium"
                      >
                        <ArrowRightLeft size={16} /> <span className="text-xs">Movimiento</span>
                      </button>
                      <button onClick={() => { setForm(item as any); setEditingId(item.id); setIsModalOpen(true); }} className="p-2 text-primary hover:bg-secondary border border-transparent rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-destructive hover:bg-destructive/10 border border-transparent rounded-lg transition-colors">
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

      {/* MODAL 1: Crear/Editar Activo (CRUD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-elegant animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display text-xl text-primary">{editingId ? "Editar Activo" : "Nuevo Activo Base"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Nombre</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Categoría</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm">
                    <option value="Litúrgico">Litúrgico</option><option value="Audio/Video">Audio/Video</option>
                    <option value="Ornamentos">Ornamentos</option><option value="Mobiliario">Mobiliario</option><option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Stock Inicial</label>
                  <input required type="number" min="0" disabled={!!editingId} value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} 
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm disabled:opacity-50 disabled:bg-secondary" title={editingId ? "Usa el motor de movimientos para cambiar el stock" : ""} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm">
                    <option value="Disponible">Disponible</option><option value="En uso">En uso</option><option value="En reparación">En reparación</option><option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Ubicación</label>
                  <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gold text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSaving} className="w-full bg-gradient-gold text-primary font-bold py-2.5 rounded-lg hover:shadow-md transition-all">
                  {isSaving ? "Guardando..." : "Guardar Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Motor Transaccional (Registrar Movimiento) */}
      {isTxModalOpen && selectedItemForTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-elegant animate-in zoom-in-95 border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between p-5 border-b border-border bg-indigo-50/50 rounded-t-2xl">
              <div>
                <h3 className="font-display text-xl text-indigo-900 flex items-center gap-2">
                  <ArrowRightLeft size={20} /> Registrar Movimiento
                </h3>
                <p className="text-xs text-indigo-700/80 font-medium mt-1">Activo: {selectedItemForTx.name}</p>
              </div>
              <button onClick={() => setIsTxModalOpen(false)} className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-800"><X size={18} /></button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Tipo de Movimiento</label>
                  <select value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})} className="w-full px-3 py-2 border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white">
                    <option value="Salida">Salida / Préstamo</option>
                    <option value="Entrada">Entrada / Devolución</option>
                    <option value="Mantenimiento">Envío a Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Cantidad</label>
                  <input required type="number" min="1" max={txForm.type === "Salida" ? selectedItemForTx.quantity : undefined} value={txForm.quantity} onChange={e => setTxForm({...txForm, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 text-sm" />
                  {txForm.type === "Salida" && <p className="text-[10px] text-muted-foreground mt-1 text-right">Max: {selectedItemForTx.quantity}</p>}
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Responsable (Quién retira o entrega)</label>
                <input required type="text" value={txForm.responsible_person} onChange={e => setTxForm({...txForm, responsible_person: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="Ej. Juan (Coro) / P. Tommy" />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">Observaciones / Motivo</label>
                <textarea rows={2} value={txForm.notes} onChange={e => setTxForm({...txForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-indigo-500 text-sm resize-none" placeholder="Estado en el que se entrega..." />
              </div>
              <div className="pt-4 mt-2 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsTxModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-secondary">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <History size={16} /> {isSaving ? "Procesando..." : "Confirmar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-4 bg-card border border-border">
          {toast.type === "success" ? <CheckCircle2 className="text-green-500 shrink-0" size={18} /> : <AlertCircle className="text-destructive shrink-0" size={18} />}
          <span className="text-sm font-medium text-foreground">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
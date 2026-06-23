import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, Plus, TrendingUp, TrendingDown, DollarSign, 
  Wallet, FileText, ArrowDownToLine, ArrowUpFromLine
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type CajaRow = { 
  id: string; tipo: "INGRESO" | "EGRESO"; concepto: string; 
  categoria: string; monto: number; metodo_pago: string; 
  fecha_movimiento: string; 
};

export function SecretariaDashboard({ userName, logout }: { userName: string, logout: () => void }) {
  const [movimientos, setMovimientos] = useState<CajaRow[]>([]);
  const [loading, setLoading] = useState(false);
  
  const emptyForm = { tipo: "INGRESO", concepto: "", categoria: "Intenciones", monto: "", metodo_pago: "EFECTIVO" };
  const [form, setForm] = useState(emptyForm);

  // Cargar datos al montar el componente
  useEffect(() => { loadMovimientos(); }, []);

  const loadMovimientos = async () => {
    // Traemos los movimientos del mes actual para el balance
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    const { data } = await supabase
      .from("caja_movimientos")
      .select("*")
      .gte("fecha_movimiento", startOfMonth.toISOString().split('T')[0])
      .order("created_at", { ascending: false });
      
    if (data) setMovimientos(data as CajaRow[]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("caja_movimientos").insert({
      tipo: form.tipo,
      concepto: form.concepto,
      categoria: form.categoria,
      monto: parseFloat(form.monto),
      metodo_pago: form.metodo_pago,
    });
    setLoading(false);
    
    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }
    
    setForm(emptyForm);
    loadMovimientos();
  };

  // Cálculos para las tarjetas (KPIs)
  const ingresosTotales = movimientos.filter(m => m.tipo === "INGRESO").reduce((acc, curr) => acc + curr.monto, 0);
  const egresosTotales = movimientos.filter(m => m.tipo === "EGRESO").reduce((acc, curr) => acc + curr.monto, 0);
  const balanceNeto = ingresosTotales - egresosTotales;

  // Datos preparados para el gráfico
  const chartData = [
    { name: "Ingresos", valor: ingresosTotales, color: "#10b981" }, // Esmeralda
    { name: "Egresos", valor: egresosTotales, color: "#ef4444" }    // Rojo
  ];

  const formatMoney = (amount: number) => `S/ ${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col">
      {/* HEADER DE SECRETARÍA */}
      <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="font-display text-lg text-primary leading-none">Caja Parroquial</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Gestión de aportes y constancias</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary">{userName}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Secretaría</p>
          </div>
          <button onClick={logout} className="p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="font-display text-lg text-primary mb-4 flex items-center gap-2">
              <Plus size={18} /> Registrar Movimiento
            </h2>
            <form onSubmit={submit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
                <button type="button" onClick={() => setForm({...form, tipo: "INGRESO"})}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${form.tipo === "INGRESO" ? "bg-white text-green-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  INGRESO
                </button>
                <button type="button" onClick={() => setForm({...form, tipo: "EGRESO"})}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${form.tipo === "EGRESO" ? "bg-white text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  EGRESO
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Concepto</label>
                <input required placeholder="Ej: Constancia de Bautismo" value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-gold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Monto (S/)</label>
                  <input required type="number" step="0.10" min="0.10" placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-gold font-mono" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Método</label>
                  <select value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-gold">
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Categoría</label>
                <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-gold">
                  <option value="Intenciones">Intenciones de Misa</option>
                  <option value="Sacramentos">Sacramentos / Trámites</option>
                  <option value="Donaciones">Donaciones / Limosna</option>
                  <option value="Servicios">Servicios Básicos</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:shadow-md transition-all">
                {loading ? "Guardando..." : "Guardar Registro"}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: MÉTRICAS Y LISTA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjetas KPI */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <ArrowDownToLine size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Ingresos del Mes</span>
              </div>
              <p className="text-2xl font-display text-primary">{formatMoney(ingresosTotales)}</p>
            </div>
            
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ArrowUpFromLine size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Egresos del Mes</span>
              </div>
              <p className="text-2xl font-display text-primary">{formatMoney(egresosTotales)}</p>
            </div>

            <div className={`border p-5 rounded-2xl shadow-sm ${balanceNeto >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`flex items-center gap-2 mb-2 ${balanceNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                <DollarSign size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Balance Neto</span>
              </div>
              <p className={`text-2xl font-display ${balanceNeto >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {formatMoney(balanceNeto)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Gráfico */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm h-72 flex flex-col">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><TrendingUp size={16} /> Flujo Mensual</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => formatMoney(value)} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lista de Movimientos Recientes */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm h-72 flex flex-col">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><FileText size={16} /> Últimos Registros</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {movimientos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center mt-10">No hay movimientos este mes.</p>
                ) : (
                  movimientos.slice(0, 15).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border/50">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold text-primary truncate">{m.concepto}</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{m.categoria} • {m.metodo_pago}</p>
                      </div>
                      <p className={`text-sm font-mono font-bold shrink-0 ${m.tipo === "INGRESO" ? "text-green-600" : "text-red-500"}`}>
                        {m.tipo === "INGRESO" ? "+" : "-"}{formatMoney(m.monto)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, FileSpreadsheet, ArrowDownToLine, ArrowUpFromLine, DollarSign,
  TrendingUp, Filter,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";

type CajaRow = {
  id: string;
  tipo: "INGRESO" | "EGRESO";
  concepto: string;
  categoria: string;
  monto: number;
  metodo_pago: string;
  fecha_movimiento: string | null;
  created_at: string | null;
};

const formatMoney = (amount: number) => `S/ ${amount.toFixed(2)}`;

// Primer día del mes actual en formato YYYY-MM-DD
function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}
function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function CajaManager({ showToast }: { showToast?: (msg: string, type?: "success" | "error") => void }) {
  const notify = (msg: string, type: "success" | "error" = "success") =>
    showToast ? showToast(msg, type) : (type === "error" ? alert(msg) : undefined);

  const [movimientos, setMovimientos] = useState<CajaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [desde, setDesde] = useState(firstDayOfMonth());
  const [hasta, setHasta] = useState(today());
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "INGRESO" | "EGRESO">("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");

  useEffect(() => { loadMovimientos(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [desde, hasta]);

  const loadMovimientos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("caja_movimientos")
      .select("*")
      .gte("fecha_movimiento", desde)
      .lte("fecha_movimiento", hasta)
      .order("fecha_movimiento", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) notify("Error al cargar movimientos: " + error.message, "error");
    if (data) setMovimientos(data as CajaRow[]);
    setLoading(false);
  };

  // Categorías disponibles en el rango cargado
  const categorias = useMemo(() => {
    const set = new Set(movimientos.map(m => m.categoria));
    return Array.from(set).sort();
  }, [movimientos]);

  // Aplicar filtros de tipo/categoría en cliente
  const filtered = useMemo(() => {
    return movimientos.filter(m =>
      (filtroTipo === "TODOS" || m.tipo === filtroTipo) &&
      (filtroCategoria === "TODAS" || m.categoria === filtroCategoria)
    );
  }, [movimientos, filtroTipo, filtroCategoria]);

  const ingresos = filtered.filter(m => m.tipo === "INGRESO").reduce((a, c) => a + c.monto, 0);
  const egresos = filtered.filter(m => m.tipo === "EGRESO").reduce((a, c) => a + c.monto, 0);
  const balance = ingresos - egresos;

  // Datos del gráfico: monto por categoría (ingresos)
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of filtered) {
      const signed = m.tipo === "INGRESO" ? m.monto : -m.monto;
      map[m.categoria] = (map[m.categoria] ?? 0) + signed;
    }
    return Object.entries(map)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [filtered]);

  const exportarExcel = () => {
    if (filtered.length === 0) { notify("No hay movimientos para exportar", "error"); return; }

    const wb = XLSX.utils.book_new();

    // Hoja Resumen
    const wsResumen = XLSX.utils.aoa_to_sheet([
      ["Reporte de Caja Parroquial"],
      ["Desde", desde],
      ["Hasta", hasta],
      ["Tipo", filtroTipo],
      ["Categoría", filtroCategoria],
      [],
      ["Total Ingresos", ingresos],
      ["Total Egresos", egresos],
      ["Balance Neto", balance],
      ["N° de Movimientos", filtered.length],
    ]);
    wsResumen["!cols"] = [{ wch: 22 }, { wch: 26 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Hoja Detalle
    const detalle = filtered.map((m, i) => ({
      "N°": i + 1,
      "Fecha": m.fecha_movimiento ?? "",
      "Tipo": m.tipo,
      "Concepto": m.concepto,
      "Categoría": m.categoria,
      "Método": m.metodo_pago,
      "Monto (S/)": m.monto,
    }));
    const wsDetalle = XLSX.utils.json_to_sheet(detalle);
    wsDetalle["!cols"] = [{ wch: 6 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

    XLSX.writeFile(wb, `Caja_${desde}_a_${hasta}.xlsx`);
    notify("Excel generado");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* FILTROS */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
          <Filter size={14} /> Filtros
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Desde</label>
            <input type="date" value={desde} max={hasta} onChange={e => setDesde(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Hasta</label>
            <input type="date" value={hasta} min={desde} onChange={e => setHasta(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as typeof filtroTipo)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
              <option value="TODOS">Todos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="EGRESO">Egresos</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Categoría</label>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold">
              <option value="TODAS">Todas</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-card">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ArrowDownToLine size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Ingresos</span>
          </div>
          <p className="text-2xl font-display text-primary">{formatMoney(ingresos)}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-card">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <ArrowUpFromLine size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Egresos</span>
          </div>
          <p className="text-2xl font-display text-primary">{formatMoney(egresos)}</p>
        </div>
        <div className={`border p-5 rounded-2xl shadow-card ${balance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className={`flex items-center gap-2 mb-2 ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
            <DollarSign size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Balance Neto</span>
          </div>
          <p className={`text-2xl font-display ${balance >= 0 ? "text-green-800" : "text-red-800"}`}>{formatMoney(balance)}</p>
        </div>
      </div>

      {/* GRÁFICO + EXPORTAR */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2"><TrendingUp size={16} /> Balance por categoría</h3>
          <button onClick={exportarExcel} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors">
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>
        </div>
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin datos en este rango.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `S/${v}`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.valor >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Movimientos ({filtered.length})</h3>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No hay movimientos con estos filtros.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-[10px] uppercase text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left font-bold px-4 py-2">Fecha</th>
                  <th className="text-left font-bold px-4 py-2">Concepto</th>
                  <th className="text-left font-bold px-4 py-2 hidden sm:table-cell">Categoría</th>
                  <th className="text-left font-bold px-4 py-2 hidden md:table-cell">Método</th>
                  <th className="text-right font-bold px-4 py-2">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{m.fecha_movimiento ?? "—"}</td>
                    <td className="px-4 py-2.5 font-medium text-primary">{m.concepto}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">{m.categoria}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">{m.metodo_pago}</td>
                    <td className={`px-4 py-2.5 text-right font-mono font-bold whitespace-nowrap ${m.tipo === "INGRESO" ? "text-green-600" : "text-red-500"}`}>
                      {m.tipo === "INGRESO" ? "+" : "-"}{formatMoney(m.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";

export function InventoryDashboard() {
  // Estados para filtros avanzados (ej. búsqueda por nombre, filtro por estado o categoría)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="p-6 space-y-6 bg-white rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-display text-primary font-semibold">Inventario de Activos Parroquiales</h2>
            <p className="text-sm text-muted-foreground">Control estricto de bienes y herramientas litúrgicas.</p>
          </div>
          <button className="bg-gradient-gold text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:scale-[1.02] transition-transform">
            + Registrar Nuevo Activo
          </button>
        </div>

        {/* Barra de Filtros Avanzados */}
        <div className="grid sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border">
          <input 
            type="text" 
            placeholder="Buscar por nombre (ej. Cáliz)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
            <option value="En reparación">En reparación</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        {/* La tabla de datos consumirá la información usando TanStack Query filtrando en memoria */}
        <div className="text-center text-sm text-muted-foreground py-8">
          Tabla de activos y registro de transacciones (Listo para conectar consultas).
        </div>
      </div>
    </ProtectedRoute>
  );
}
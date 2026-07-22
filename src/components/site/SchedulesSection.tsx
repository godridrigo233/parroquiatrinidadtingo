"use client";
import { useSchedules } from "@/hooks/useParishData";
import { Clock, AlertCircle } from "lucide-react";

export function SchedulesSection() {
  // TanStack Query gestiona el caché, la carga y los errores en segundo plano
  const { data: schedules, isLoading, isError } = useSchedules();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#1A2940] bg-white rounded-2xl border border-[#CBD5E1] animate-pulse">
        <p className="text-sm font-medium">⏳ Cargando horarios de misa y atención...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
        <AlertCircle size={18} className="shrink-0" />
        <span>No se pudieron cargar los horarios en este momento. Por favor, intenta de nuevo más tarde.</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {schedules?.map((item, index) => (
        <div 
          key={index} 
          className="p-4 bg-white border border-[#CBD5E1] rounded-2xl shadow-sm hover:border-[#C8A45C] transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-1.5 text-[#C8A45C] font-semibold text-xs uppercase mb-1.5 tracking-wider">
            <Clock size={14} />
            <span>{item.category}</span>
          </div>
          <h4 className="font-bold text-[#0F1B2D] text-base">{item.day_label}</h4>
          <p className="text-sm text-[#1A2940] font-medium mt-1">{item.time_label}</p>
          {item.notes && (
            <div className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 p-2 rounded-lg leading-relaxed">
              ℹ️ {item.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
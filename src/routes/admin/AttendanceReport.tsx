// src/components/admin/AttendanceReport.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, UserX, FileSpreadsheet, Loader2, Calendar } from "lucide-react";

interface AttendanceReportProps {
  meetingId: string;
}

export function AttendanceReport({ meetingId }: AttendanceReportProps) {
  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<{ title: string; date: string } | null>(null);
  const [presentes, setPresentes] = useState<any[]>([]);
  const [ausentes, setAusentes] = useState<any[]>([]);

  useEffect(() => {
    obtenerReporte();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [meetingId]);

  const obtenerReporte = async () => {
    setLoading(true);
    try {
      // 1. Obtener datos de la reunión actual
      const { data: meeting } = await supabase
        .from("meetings")
        .select("title, scheduled_date")
        .eq("id", meetingId)
        .single();

      if (meeting) {
        setMeetingInfo({
          title: meeting.title,
          date: meeting.scheduled_date
        });
      }

      // 2. Obtener todos los catequistas registrados
      const { data: todosLosCatequistas } = await supabase
        .from("catechists")
        .select("id, code, full_name")
        .order("full_name", { ascending: true });

      // 3. Obtener quiénes marcaron asistencia hoy
      const { data: asistencias Hoy } = await supabase
        .from("attendance")
        .select("catechist_id")
        .eq("meeting_id", meetingId);

      const idsAsistieron = asistenciasHoy?.map((a) => a.catechist_id) || [];

      // 4. Clasificar en Presentes y Ausentes
      if (todosLosCatequistas) {
        const listPresentes = todosLosCatequistas.filter((c) => idsAsistieron.includes(c.id));
        const listAusentes = todosLosCatequistas.filter((c) => !idsAsistieron.includes(c.id));

        setPresentes(listPresentes);
        setAusentes(listAusentes);
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN MAESTRA: Exportar las listas directamente a un Excel/CSV limpio
  const descargarExcelCSV = () => {
    if (!meetingInfo) return;

    // Encabezados del documento
    let contenidoCSV = "Código,Nombre Completo,Estado,Fecha,Actividad\n";

    // Agregar filas de los Presentes
    presentes.forEach((c) => {
      contenidoCSV += `"${c.code}","${c.full_name}","PRESENTE","${meetingInfo.date}","${meetingInfo.title}"\n`;
    });

    // Agregar filas de los Ausentes
    ausentes.forEach((c) => {
      contenidoCSV += `"${c.code}","${c.full_name}","AUSENTE","${meetingInfo.date}","${meetingInfo.title}"\n`;
    });

    // Añadimos el BOM (\uFEFF) para forzar a Excel a leerlo en UTF-8 con tildes correctas
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Crear un link temporal de descarga
    const link = document.createElement("a");
    link.href = url;
    // Nombre dinámico del archivo: ej. "Reporte_Asistencia_2026-06-20.csv"
    link.setAttribute("download", `Reporte_Asistencia_${meetingInfo.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="animate-spin text-gold mb-2" size={24} />
        <p className="text-xs">Procesando registros...</p>
      </div>
    );
  }

  const totalCatequistas = presentes.length + ausentes.length;
  const porcentajeAsistencia = totalCatequistas > 0 ? Math.round((presentes.length / totalCatequistas) * 100) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* TARJETA DE ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-3 gap-3 bg-secondary/30 p-4 rounded-2xl border border-border/60 text-center">
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Presentes</span>
          <span className="text-xl font-display font-bold text-green-600">{presentes.length}</span>
        </div>
        <div className="border-x border-border">
          <span className="block text-xs font-medium text-muted-foreground">Ausentes</span>
          <span className="text-xl font-display font-bold text-red-500">{ausentes.length}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-muted-foreground">Quórum</span>
          <span className="text-xl font-display font-bold text-primary">{porcentajeAsistencia}%</span>
        </div>
      </div>

      {/* BOTÓN DE DESCARGA AUTOMÁTICA */}
      <button 
        onClick={descargarExcelCSV}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/10 transition-colors"
      >
        <FileSpreadsheet size={18} /> Descargar Reporte (Excel)
      </button>

      {/* VISTA DE LISTAS EN PANTALLA */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        
        {/* SECCIÓN PRESENTES */}
        {presentes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck size={14} /> Presentes ({presentes.length})
            </h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {presentes.map((c) => (
                <div key={c.id} className="p-3 text-sm flex justify-between items-center bg-green-50/20">
                  <span className="font-medium text-primary uppercase">{c.full_name}</span>
                  <span className="text-[11px] font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded-md font-bold">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN AUSENTES */}
        {ausentes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 mt-4 flex items-center gap-1.5">
              <UserX size={14} /> Ausentes ({ausentes.length})
            </h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {ausentes.map((c) => (
                <div key={c.id} className="p-3 text-sm flex justify-between items-center bg-red-50/10">
                  <span className="text-muted-foreground uppercase">{c.full_name}</span>
                  <span className="text-[11px] font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-bold">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, UserX, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface AttendanceReportProps {
  meetingId: string;
}

interface Catechist {
  id: string;
  code: string;
  full_name: string;
}

export function AttendanceReport({ meetingId }: AttendanceReportProps) {
  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<{ title: string; date: string } | null>(null);
  const [presentes, setPresentes] = useState<Catechist[]>([]);
  const [ausentes, setAusentes] = useState<Catechist[]>([]);
  const [justArrivedId, setJustArrivedId] = useState<string | null>(null);

  // Guardamos el directorio completo en un ref para no tener que
  // volver a pedirlo a Supabase cada vez que llega un evento realtime.
  const directorioRef = useRef<Catechist[]>([]);

  useEffect(() => {
    obtenerReporte();

    // --- SUSCRIPCIÓN REALTIME ---
    // Cada vez que se inserta una asistencia para esta reunión,
    // movemos al catequista de "ausentes" a "presentes" sin recargar nada.
    const channel = supabase
      .channel(`attendance-report-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const catechistId = payload.new.catechist_id as string;

          setAusentes((prevAusentes) => {
            const catequista = prevAusentes.find((c) => c.id === catechistId);
            if (!catequista) return prevAusentes; // ya estaba presente o no existe
            return prevAusentes.filter((c) => c.id !== catechistId);
          });

          setPresentes((prevPresentes) => {
            if (prevPresentes.some((c) => c.id === catechistId)) return prevPresentes;
            const catequista = directorioRef.current.find((c) => c.id === catechistId);
            if (!catequista) return prevPresentes;
            return [...prevPresentes, catequista].sort((a, b) => a.full_name.localeCompare(b.full_name));
          });

          // Resalta brevemente al que acaba de llegar en la lista de presentes
          setJustArrivedId(catechistId);
          setTimeout(() => setJustArrivedId(null), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          date: meeting.scheduled_date,
        });
      }

      // 2. Obtener todos los catequistas registrados
      const { data: todosLosCatequistas } = await supabase
        .from("catechists")
        .select("id, code, full_name")
        .order("full_name", { ascending: true });

      // 3. Obtener quiénes marcaron asistencia hoy
      const { data: asistenciasHoy } = await supabase
        .from("attendance")
        .select("catechist_id")
        .eq("meeting_id", meetingId);

      const idsAsistieron = asistenciasHoy?.map((a) => a.catechist_id) || [];

      // 4. Clasificar en Presentes y Ausentes
      if (todosLosCatequistas) {
        directorioRef.current = todosLosCatequistas;

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

  // FUNCIÓN MAESTRA: Exportar las listas a un archivo Excel (.xlsx) real,
  // con dos hojas separadas: Presentes y Ausentes.
  const descargarExcel = () => {
    if (!meetingInfo) return;

    const filaPresentes = presentes.map((c) => ({
      Código: c.code,
      "Nombre Completo": c.full_name,
      Estado: "PRESENTE",
      Fecha: meetingInfo.date,
      Actividad: meetingInfo.title,
    }));

    const filaAusentes = ausentes.map((c) => ({
      Código: c.code,
      "Nombre Completo": c.full_name,
      Estado: "AUSENTE",
      Fecha: meetingInfo.date,
      Actividad: meetingInfo.title,
    }));

    const wb = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.aoa_to_sheet([
      ["Reporte de Asistencia"],
      ["Actividad", meetingInfo.title],
      ["Fecha", meetingInfo.date],
      ["Presentes", presentes.length],
      ["Ausentes", ausentes.length],
      ["Total", presentes.length + ausentes.length],
    ]);
    wsResumen["!cols"] = [{ wch: 16 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    const wsPresentes = XLSX.utils.json_to_sheet(filaPresentes);
    wsPresentes["!cols"] = [{ wch: 10 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsPresentes, "Presentes");

    const wsAusentes = XLSX.utils.json_to_sheet(filaAusentes);
    wsAusentes["!cols"] = [{ wch: 10 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsAusentes, "Ausentes");

    XLSX.writeFile(wb, `Reporte_Asistencia_${meetingInfo.date}.xlsx`);
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
        onClick={descargarExcel}
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
                <div
                  key={c.id}
                  className={`p-3 text-sm flex justify-between items-center transition-colors duration-700 ${
                    justArrivedId === c.id ? "bg-green-200/60" : "bg-green-50/20"
                  }`}
                >
                  <span className="font-medium text-primary uppercase">{c.full_name}</span>
                  <span className="text-[11px] font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded-md font-bold">
                    {c.code}
                  </span>
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
                  <span className="text-[11px] font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-bold">
                    {c.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
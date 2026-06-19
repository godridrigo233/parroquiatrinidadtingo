import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, UserX, FileSpreadsheet, Loader2, Clock, FileSignature } from "lucide-react";
import * as XLSX from "xlsx";

interface AttendanceReportProps {
  meetingId: string;
}

interface Catechist {
  id: string;
  code: string;
  full_name: string;
  status?: string;
  notes?: string;
}

export function AttendanceReport({ meetingId }: AttendanceReportProps) {
  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<{ title: string; date: string } | null>(null);
  
  const [presentes, setPresentes] = useState<Catechist[]>([]);
  const [tardanzas, setTardanzas] = useState<Catechist[]>([]);
  const [justificados, setJustificados] = useState<Catechist[]>([]);
  const [ausentes, setAusentes] = useState<Catechist[]>([]);
  
  const [justArrivedId, setJustArrivedId] = useState<string | null>(null);

  // Guardamos el directorio completo en un ref
  const directorioRef = useRef<Catechist[]>([]);

  useEffect(() => {
    obtenerReporte();

    // --- SUSCRIPCIÓN REALTIME ---
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
          const status = payload.new.status as string;

          // Lo quitamos de ausentes
          setAusentes((prev) => prev.filter((c) => c.id !== catechistId));

          const catequista = directorioRef.current.find((c) => c.id === catechistId);
          if (!catequista) return;

          // Lo agregamos a la lista que corresponda
          if (status === 'PRESENTE') {
            setPresentes((prev) => {
              if (prev.some((c) => c.id === catechistId)) return prev;
              return [...prev, { ...catequista, status }].sort((a, b) => a.full_name.localeCompare(b.full_name));
            });
          } else if (status === 'TARDANZA') {
            setTardanzas((prev) => {
              if (prev.some((c) => c.id === catechistId)) return prev;
              return [...prev, { ...catequista, status }].sort((a, b) => a.full_name.localeCompare(b.full_name));
            });
          }

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
      // 1. Obtener datos de la reunión
      const { data: meeting } = await supabase.from("meetings").select("title, scheduled_date").eq("id", meetingId).single();
      if (meeting) setMeetingInfo({ title: meeting.title, date: meeting.scheduled_date });

      // 2. Obtener catequistas
      const { data: todosLosCatequistas } = await supabase.from("catechists").select("id, code, full_name").order("full_name", { ascending: true });

      // 3. Obtener asistencias con ESTADO Y NOTAS
      const { data: asistenciasHoy } = await supabase.from("attendance").select("catechist_id, status, notes").eq("meeting_id", meetingId);

      if (todosLosCatequistas) {
        directorioRef.current = todosLosCatequistas;

        const listPresentes: Catechist[] = [];
        const listTardanzas: Catechist[] = [];
        const listJustificados: Catechist[] = [];
        const listAusentes: Catechist[] = [];

        todosLosCatequistas.forEach(cat => {
          const asistencia = asistenciasHoy?.find(a => a.catechist_id === cat.id);
          if (!asistencia) {
            listAusentes.push(cat);
          } else if (asistencia.status === 'PRESENTE') {
            listPresentes.push({ ...cat, status: asistencia.status });
          } else if (asistencia.status === 'TARDANZA') {
            listTardanzas.push({ ...cat, status: asistencia.status });
          } else if (asistencia.status === 'JUSTIFICADO') {
            listJustificados.push({ ...cat, status: asistencia.status, notes: asistencia.notes });
          }
        });

        setPresentes(listPresentes);
        setTardanzas(listTardanzas);
        setJustificados(listJustificados);
        setAusentes(listAusentes);
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PARA JUSTIFICAR A UN AUSENTE
  const justificarFalta = async (catechistId: string, nombre: string) => {
    const motivo = window.prompt(`Ingresa el motivo de justificación para ${nombre} (Ej: Examen UCSM, Salud, etc.):`);
    
    if (motivo && motivo.trim() !== "") {
      setLoading(true);
      const { error } = await supabase.from("attendance").insert({
        meeting_id: meetingId,
        catechist_id: catechistId,
        status: 'JUSTIFICADO',
        notes: motivo.trim().toUpperCase()
      });

      if (!error) {
        obtenerReporte(); // Recargamos para actualizar las listas
      } else {
        alert("Error al guardar la justificación.");
        setLoading(false);
      }
    }
  };

  const descargarExcel = () => {
    if (!meetingInfo) return;

    const exportarData = (lista: Catechist[], estadoStr: string) => lista.map(c => ({
      Código: c.code,
      "Nombre Completo": c.full_name,
      Estado: estadoStr,
      "Motivo/Notas": c.notes || "",
      Fecha: meetingInfo.date,
      Actividad: meetingInfo.title,
    }));

    const wb = XLSX.utils.book_new();

    // Hoja Resumen
    const wsResumen = XLSX.utils.aoa_to_sheet([
      ["Reporte de Asistencia"],
      ["Actividad", meetingInfo.title],
      ["Fecha", meetingInfo.date],
      ["Presentes a Tiempo", presentes.length],
      ["Tardanzas", tardanzas.length],
      ["Justificados", justificados.length],
      ["Ausentes", ausentes.length],
      ["Total Registrados", presentes.length + tardanzas.length + justificados.length + ausentes.length],
    ]);
    wsResumen["!cols"] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // Función auxiliar para agregar hojas con formato de columnas
    const agregarHoja = (datos: any[], nombre: string) => {
      const ws = XLSX.utils.json_to_sheet(datos);
      ws["!cols"] = [{ wch: 10 }, { wch: 32 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(wb, ws, nombre);
    };

    agregarHoja([...exportarData(presentes, "PRESENTE"), ...exportarData(tardanzas, "TARDANZA")], "Asistencias Físicas");
    agregarHoja(exportarData(justificados, "JUSTIFICADO"), "Justificaciones");
    agregarHoja(exportarData(ausentes, "AUSENTE"), "Faltas");

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

  const totalCatequistas = presentes.length + tardanzas.length + justificados.length + ausentes.length;
  const asistenFisicos = presentes.length + tardanzas.length;
  const porcentajeAsistencia = totalCatequistas > 0 ? Math.round((asistenFisicos / totalCatequistas) * 100) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* TARJETA DE ESTADÍSTICAS */}
      <div className="grid grid-cols-4 gap-2 bg-secondary/30 p-4 rounded-2xl border border-border/60 text-center">
        <div>
          <span className="block text-[10px] uppercase font-medium text-muted-foreground">A Tiempo</span>
          <span className="text-lg font-display font-bold text-green-600">{presentes.length}</span>
        </div>
        <div className="border-l border-border">
          <span className="block text-[10px] uppercase font-medium text-muted-foreground">Tarde</span>
          <span className="text-lg font-display font-bold text-yellow-600">{tardanzas.length}</span>
        </div>
        <div className="border-l border-border">
          <span className="block text-[10px] uppercase font-medium text-muted-foreground">Justif.</span>
          <span className="text-lg font-display font-bold text-blue-500">{justificados.length}</span>
        </div>
        <div className="border-l border-border bg-red-50/50 rounded-r-xl">
          <span className="block text-[10px] uppercase font-bold text-red-800">Faltas</span>
          <span className="text-lg font-display font-bold text-red-600">{ausentes.length}</span>
        </div>
      </div>

      {/* BOTÓN DESCARGA EXCEL AVANZADO */}
      <button onClick={descargarExcel} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/10 transition-colors">
        <FileSpreadsheet size={18} /> Descargar Excel Completo
      </button>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">

        {/* PRESENTES */}
        {presentes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><UserCheck size={14} /> Presentes a Tiempo ({presentes.length})</h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {presentes.map((c) => (
                <div key={c.id} className={`p-3 text-sm flex justify-between items-center transition-colors duration-700 ${justArrivedId === c.id ? "bg-green-200/60" : "bg-green-50/20"}`}>
                  <span className="font-medium text-primary uppercase">{c.full_name}</span>
                  <span className="text-[11px] font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded-md font-bold">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARDANZAS */}
        {tardanzas.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={14} /> Tardanzas ({tardanzas.length})</h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {tardanzas.map((c) => (
                <div key={c.id} className={`p-3 text-sm flex justify-between items-center transition-colors duration-700 ${justArrivedId === c.id ? "bg-yellow-200/80" : "bg-yellow-50/30"}`}>
                  <span className="font-medium text-primary uppercase">{c.full_name}</span>
                  <span className="text-[11px] font-mono bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-md font-bold">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JUSTIFICADOS */}
        {justificados.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileSignature size={14} /> Justificados ({justificados.length})</h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {justificados.map((c) => (
                <div key={c.id} className="p-3 text-sm flex flex-col bg-blue-50/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-primary uppercase">{c.full_name}</span>
                    <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">{c.code}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground italic">Motivo: {c.notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUSENTES CON BOTÓN DE JUSTIFICAR */}
        {ausentes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 mt-4 flex items-center gap-1.5"><UserX size={14} /> Faltas sin justificar ({ausentes.length})</h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {ausentes.map((c) => (
                <div key={c.id} className="p-3 text-sm flex justify-between items-center bg-red-50/10">
                  <span className="text-muted-foreground uppercase">{c.full_name}</span>
                  <button onClick={() => justificarFalta(c.id, c.full_name)} className="text-[10px] font-bold bg-secondary hover:bg-border text-primary px-3 py-1.5 rounded-lg transition-colors border border-border">
                    Justificar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, XCircle, Calendar, Camera, Loader2, Plus, Trash2, ListTodo, Clock, CalendarPlus, History, FileText, UserPlus } from "lucide-react";
import { AttendanceReport } from "./AttendanceReport";
import { decryptQR } from "@/utils/crypto";
import { DirectoryManager } from "./DirectoryManager";

export function AttendanceScanner() {
  const [loading, setLoading] = useState(true);

  // ESTADOS DE VISTA Y REPORTES
  const [view, setView] = useState<'scanner' | 'agenda' | 'history' | 'report' | 'directory'>('scanner');
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportReturnView, setReportReturnView] = useState<'scanner' | 'history'>('scanner');
  const [userRole, setUserRole] = useState<string>('admin'); // Cambia a 'editor' si no es admin

  // ESTADOS DE REUNIONES
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [lastScan, setLastScan] = useState<{ status: 'success' | 'error', msg: string } | null>(null);

  // ESTADOS DEL FORMULARIO
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("16:00");
  const [newEndTime, setNewEndTime] = useState("18:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hours = String(hoy.getHours()).padStart(2, '0');
    const minutes = String(hoy.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:00`;

    const { data: allMeetings } = await supabase.from("meetings").select("*");

    if (allMeetings) {
      const sorted = [...allMeetings].sort((a, b) => {
        if (a.scheduled_date === b.scheduled_date) return a.scheduled_time.localeCompare(b.scheduled_time);
        return a.scheduled_date.localeCompare(b.scheduled_date);
      });

      const active = sorted.find(m => m.scheduled_date === dateStr && m.scheduled_end_time >= timeStr);
      setCurrentMeeting(active || null);

      const upcoming = sorted.filter(m => m.scheduled_date > dateStr || (m.scheduled_date === dateStr && m.scheduled_end_time >= timeStr));
      setMeetings(upcoming);

      const past = sorted.filter(m => m.scheduled_date < dateStr || (m.scheduled_date === dateStr && m.scheduled_end_time < timeStr)).reverse();
      setPastMeetings(past);
    }
    setLoading(false);
  };

  const handleScan = async (scannedText: string) => {
    if (!currentMeeting) return;

    const decryptedId = decryptQR(scannedText);

    if (!decryptedId) {
      setLastScan({ status: 'error', msg: "QR Inválido o Falso" });
      setTimeout(() => setLastScan(null), 2500);
      return;
    }

    // 1) Validar que el catequista exista ANTES de registrar la asistencia.
    //    Así nunca insertamos un registro "huérfano" y siempre tenemos
    //    el nombre real disponible para mostrarlo en pantalla.
    const { data: catData, error: catError } = await supabase
      .from("catechists")
      .select("full_name")
      .eq("id", decryptedId)
      .maybeSingle();

    if (catError || !catData) {
      setLastScan({ status: 'error', msg: "Catequista no encontrado" });
      setTimeout(() => setLastScan(null), 2500);
      return;
    }

    // 2) Registrar la asistencia ya con el nombre confirmado.
    const { error } = await supabase.from("attendance").insert({
      meeting_id: currentMeeting.id,
      catechist_id: decryptedId
    });

    if (error) {
      if (error.code === '23505') setLastScan({ status: 'error', msg: `${catData.full_name} ya está registrado` });
      else setLastScan({ status: 'error', msg: "Error al registrar." });
    } else {
      new Audio("https://actions.google.com/sounds/v1/ui/beep_short_on.ogg").play().catch(() => {});
      setLastScan({ status: 'success', msg: catData.full_name });
    }

    setTimeout(() => setLastScan(null), 2500);
  };

  const programarReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("meetings").insert({
      title: newTitle,
      scheduled_date: newDate,
      scheduled_time: newTime,
      scheduled_end_time: newEndTime
    });
    setSaving(false);

    if (error) {
      alert("Error al programar la reunión");
    } else {
      setNewTitle("");
      setNewDate("");
      setNewTime("16:00");
      setNewEndTime("18:00");
      fetchData();
    }
  };

  const eliminarReunion = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar este registro?")) return;
    await supabase.from("meetings").delete().eq("id", id);
    fetchData();
    if (view === 'report' && reportId === id) setView('history');
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    return d.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString("es-PE", { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getGoogleCalendarUrl = (title: string, dateStr: string, startTimeStr: string, endTimeStr: string) => {
    const startDate = new Date(`${dateStr}T${startTimeStr}`);
    const endDate = new Date(`${dateStr}T${endTimeStr}`);
    const formatToUTC = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title);
    url.searchParams.append('dates', `${formatToUTC(startDate)}/${formatToUTC(endDate)}`);
    url.searchParams.append('details', 'Reunión programada desde el Panel de Asistencia.');
    return url.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="animate-spin text-gold mb-2" size={32} />
        <p className="text-sm">Sincronizando sistema…</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-card max-w-lg mx-auto">

      {/* MENÚ DE NAVEGACIÓN SUPERIOR */}
      <div className="flex gap-2 mb-6 bg-secondary/50 p-1.5 rounded-2xl overflow-x-auto">
        <button onClick={() => setView('scanner')} className={`flex-1 py-2.5 px-3 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 ${view === 'scanner' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Camera size={14} className="inline mr-1.5" /> Escáner
        </button>
        <button onClick={() => setView('agenda')} className={`flex-1 py-2.5 px-3 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 ${view === 'agenda' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Calendar size={14} className="inline mr-1.5" /> Agenda
        </button>
        <button onClick={() => setView('history')} className={`flex-1 py-2.5 px-3 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 ${view === 'history' || view === 'report' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <History size={14} className="inline mr-1.5" /> Historial
        </button>
        {userRole === 'admin' && (
          <button onClick={() => setView('directory')} className={`flex-1 py-2.5 px-3 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 ${view === 'directory' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <UserPlus size={14} className="inline mr-1.5" /> Directorio
          </button>
        )}
      </div>

      {/* PESTAÑA 1: AGENDA */}
      {view === 'agenda' && (
        <div className="animate-in fade-in">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8">
            <h3 className="font-display text-lg text-primary mb-4 flex items-center gap-2">
              <Plus className="text-blue-500" size={20} /> Agendar Reunión
            </h3>
            <form onSubmit={programarReunion} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Motivo / Título</label>
                <input required type="text" placeholder="Ej: Catequesis Confirmación" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Día</label>
                  <input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Desde</label>
                  <input required type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Hasta</label>
                  <input required type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:border-blue-400 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                {saving ? "Guardando..." : "Confirmar Fecha"}
              </button>
            </form>
          </div>

          <h3 className="font-display text-lg text-primary mb-4 flex items-center gap-2">
            <Calendar className="text-gold" size={20} /> Próximos Encuentros
          </h3>

          {meetings.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">Tu calendario está libre.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map(m => (
                <div key={m.id} className="group flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-gold/50 transition-colors shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary/50 rounded-xl p-2 text-center min-w-[4rem] border border-border/50">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">{new Date(m.scheduled_date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' })}</span>
                      <span className="block text-lg font-display text-primary">{m.scheduled_date.split('-')[2]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-primary mb-1">{m.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock size={12} className="text-gold" />
                        <span>{formatTime(m.scheduled_time)} - {formatTime(m.scheduled_end_time)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={getGoogleCalendarUrl(m.title, m.scheduled_date, m.scheduled_time, m.scheduled_end_time)} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                      <CalendarPlus size={18} />
                    </a>
                    <button onClick={() => eliminarReunion(m.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: HISTORIAL */}
      {view === 'history' && (
        <div className="animate-in fade-in">
          <h3 className="font-display text-lg text-primary mb-4 flex items-center gap-2">
            <History className="text-gold" size={20} /> Archivo de Asistencias
          </h3>

          {pastMeetings.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="mx-auto w-12 h-12 bg-secondary/50 text-muted-foreground rounded-full flex items-center justify-center mb-2">
                <FileText size={24} />
              </div>
              <p className="text-sm text-muted-foreground">Aún no hay reuniones pasadas en el historial.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {pastMeetings.map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm">
                  <div>
                    <p className="font-semibold text-sm text-primary mb-0.5">{m.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {formatDate(m.scheduled_date)}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => { setReportId(m.id); setReportReturnView('history'); setView('report'); }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-secondary text-primary hover:bg-border rounded-xl text-xs font-bold transition-colors">
                      Ver Reporte
                    </button>
                    <button onClick={() => eliminarReunion(m.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: ESCÁNER */}
      {view === 'scanner' && (
        <div className="animate-in fade-in">
          {!currentMeeting ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto w-16 h-16 bg-secondary/50 text-muted-foreground rounded-full flex items-center justify-center">
                <ListTodo size={32} />
              </div>
              <div>
                <h3 className="font-display text-xl text-primary font-semibold">Cámara Inactiva</h3>
                <p className="text-sm text-muted-foreground mt-2 px-6">
                  No hay sesiones programadas para este momento. Si la reunión de hoy ya terminó, búscala en el Historial.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex justify-between items-center">
                <div className="min-w-0">
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Sesión Activa
                  </span>
                  <span className="truncate block text-primary text-base font-display">{currentMeeting.title}</span>
                  <span className="block text-xs text-muted-foreground font-medium mt-0.5">
                    ⏱️ Cierra a las {formatTime(currentMeeting.scheduled_end_time)}
                  </span>
                </div>
                <button onClick={() => { setReportId(currentMeeting.id); setReportReturnView('scanner'); setView('report'); }}
                  className="px-4 py-2 bg-white border border-green-200 text-green-800 rounded-xl text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">
                  VER REPORTE
                </button>
              </div>

              <div className="rounded-3xl overflow-hidden border-8 border-secondary aspect-square relative shadow-lg bg-black">
                <Scanner onResult={(text) => handleScan(text)} options={{ delayBetweenScanSuccess: 2000 }} />
                {lastScan && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-md z-10 animate-in zoom-in-95 ${lastScan.status === 'success' ? 'bg-green-600/95' : 'bg-red-600/95'}`}>
                    {lastScan.status === 'success' ? (
                      <>
                        <CheckCircle2 size={64} className="mb-3 drop-shadow-md" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-200 mb-1">¡Registrado!</p>
                        <p className="font-display text-3xl px-6 text-center leading-tight shadow-black drop-shadow-md">{lastScan.msg}</p>
                      </>
                    ) : (
                      <>
                        <XCircle size={64} className="mb-2" />
                        <p className="font-display text-xl px-4 text-center">{lastScan.msg}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 4: REPORTE */}
      {view === 'report' && reportId && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
            <h3 className="font-display text-lg text-primary">Detalle de Asistencia</h3>
            <button onClick={() => setView(reportReturnView)} className="text-sm font-semibold text-primary px-4 py-2 bg-secondary rounded-xl hover:bg-border transition-colors">
              ← Volver
            </button>
          </div>
          <AttendanceReport meetingId={reportId} />
        </div>
      )}

      {/* PESTAÑA 5: DIRECTORIO (solo admin) */}
      {view === 'directory' && userRole === 'admin' && (
        <div className="animate-in fade-in">
          <h3 className="font-display text-lg text-primary mb-4">Directorio de Catequistas</h3>
          <DirectoryManager />
        </div>
      )}

    </div>
  );
}
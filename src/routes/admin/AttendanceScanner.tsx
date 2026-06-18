import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, XCircle, Calendar, Camera, Loader2, Plus, Trash2, ListTodo, Clock, CalendarPlus } from "lucide-react";
import { AttendanceReport } from "./AttendanceReport";
import { decryptQR } from "@/utils/crypto"; 

export function AttendanceScanner() {
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<{ status: 'success' | 'error', msg: string } | null>(null);
  
  const [view, setView] = useState<'scanner' | 'report' | 'agenda'>('scanner');
  
  const [meetings, setMeetings] = useState<any[]>([]);
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
    
    // Obtenemos la fecha exacta (YYYY-MM-DD)
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Obtenemos la hora actual (HH:MM:SS)
    const hours = String(hoy.getHours()).padStart(2, '0');
    const minutes = String(hoy.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:00`;

    // 1. Buscamos la reunión de hoy que AÚN NO HA TERMINADO
    const { data: hoyData } = await supabase
      .from("meetings")
      .select("*")
      .eq("scheduled_date", dateStr)
      .gte("scheduled_end_time", timeStr) // NUEVO: Filtra por la hora actuals
      .order("scheduled_time", { ascending: true })
      .limit(1); // Tomamos la más próxima
      
    if (hoyData && hoyData.length > 0) {
      setCurrentMeeting(hoyData[0]);
    } else {
      setCurrentMeeting(null); // Si ya pasó la hora, se oculta el escáner
    }

    // 2. Cargamos la agenda completa
    const { data: agendaData } = await supabase
      .from("meetings")
      .select("*")
      .gte("scheduled_date", dateStr)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true }); 
      
    if (agendaData) setMeetings(agendaData);
    setLoading(false);
  };

  const handleScan = async (scannedText: string) => {
    if (!currentMeeting) return;

    // 1. DESENCRIPTAMOS EL CÓDIGO QR
    const decryptedId = decryptQR(scannedText);

    if (!decryptedId) {
      setLastScan({ status: 'error', msg: "QR Inválido o Falso" });
      setTimeout(() => setLastScan(null), 2500);
      return;
    }

    // 2. Buscamos el nombre para mostrarlo en pantalla (Filtro Humano)
    const { data: catData } = await supabase
      .from("catechists")
      .select("full_name")
      .eq("id", decryptedId)
      .maybeSingle();

    // 3. Registramos la asistencia
    const { error } = await supabase.from("attendance").insert({
      meeting_id: currentMeeting.id,
      catechist_id: decryptedId 
    });

    if (error) {
      if (error.code === '23505') setLastScan({ status: 'error', msg: "¡Ya registrado hoy!" });
      else setLastScan({ status: 'error', msg: "Error al registrar." });
    } else {
      new Audio("https://actions.google.com/sounds/v1/ui/beep_short_on.ogg").play().catch(() => {});
      setLastScan({ status: 'success', msg: catData?.full_name || "Asistencia Registrada" });
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
    if (!window.confirm("¿Seguro que quieres cancelar esta reunión?")) return;
    await supabase.from("meetings").delete().eq("id", id);
    fetchData();
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
    return d.toLocaleDateString("es-PE", { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getGoogleCalendarUrl = (title: string, dateStr: string, startTimeStr: string, endTimeStr: string) => {
    const startDate = new Date(`${dateStr}T${startTimeStr}`);
    const endDate = new Date(`${dateStr}T${endTimeStr}`);

    const formatToUTC = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

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
      
      <div className="flex gap-2 mb-6 bg-secondary/50 p-1.5 rounded-2xl">
        <button 
          onClick={() => setView(currentMeeting ? 'scanner' : 'scanner')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'scanner' || view === 'report' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Camera size={16} className="inline mr-2" /> Modo Escáner
        </button>
        <button 
          onClick={() => setView('agenda')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'agenda' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Calendar size={16} className="inline mr-2" /> Agenda
        </button>
      </div>

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
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">{formatDate(m.scheduled_date).split(' ')[0]}</span>
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
                    <a 
                      href={getGoogleCalendarUrl(m.title, m.scheduled_date, m.scheduled_time, m.scheduled_end_time)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Agregar a Google Calendar"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <CalendarPlus size={18} />
                    </a>
                    <button onClick={() => eliminarReunion(m.id)} title="Cancelar reunión" className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(view === 'scanner' || view === 'report') && (
        <>
          {!currentMeeting ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto w-16 h-16 bg-secondary/50 text-muted-foreground rounded-full flex items-center justify-center">
                <ListTodo size={32} />
              </div>
              <div>
                <h3 className="font-display text-xl text-primary font-semibold">Sin actividades para hoy</h3>
                <p className="text-sm text-muted-foreground mt-2 px-6">
                  Disfruta tu día. No hay sesiones programadas para la fecha actual.
                </p>
              </div>
              <button onClick={() => setView('agenda')} className="mt-4 px-6 py-2 bg-secondary text-primary rounded-full text-sm font-medium hover:bg-border transition-colors">
                Ir a la Agenda
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex justify-between items-center">
                <div className="min-w-0">
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Sesión Activa
                  </span>
                  <span className="truncate block text-primary text-base font-display">{currentMeeting.title}</span>
                  <span className="block text-xs text-muted-foreground font-medium mt-0.5">
                    ⏱️ Horario: {formatTime(currentMeeting.scheduled_time)} a {formatTime(currentMeeting.scheduled_end_time)}
                  </span>
                </div>
                <button onClick={() => setView(view === 'scanner' ? 'report' : 'scanner')} className="px-4 py-2 bg-white border border-green-200 text-green-800 rounded-xl text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">
                  {view === 'scanner' ? "VER REPORTE" : "VOLVER A CÁMARA"}
                </button>
              </div>

              {view === 'scanner' ? (
                <div className="rounded-3xl overflow-hidden border-8 border-secondary aspect-square relative shadow-lg bg-black">
                  <Scanner onResult={(text) => handleScan(text)} options={{ delayBetweenScanSuccess: 2000 }} />
                  {/* AQUÍ ESTABA EL ERROR: Agregamos el ? de seguridad (optional chaining) para evitar crasheos si lastScan es null */}
                  {lastScan && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-md z-10 animate-in zoom-in-95 ${
                      lastScan?.status === 'success' ? 'bg-green-600/95' : 'bg-red-600/95'
                    }`}>
                      {lastScan?.status === 'success' ? (
                        <>
                          <CheckCircle2 size={64} className="mb-3 drop-shadow-md" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-200 mb-1">¡Registrado!</p>
                          <p className="font-display text-3xl px-6 text-center leading-tight shadow-black drop-shadow-md">{lastScan?.msg}</p>
                        </>
                      ) : (
                        <>
                          <XCircle size={64} className="mb-2" />
                          <p className="font-display text-xl px-4 text-center">{lastScan?.msg}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <AttendanceReport meetingId={currentMeeting.id} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
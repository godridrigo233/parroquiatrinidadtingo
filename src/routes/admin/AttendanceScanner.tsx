import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, XCircle, Calendar, Camera, Loader2, Plus, Trash2, ListTodo } from "lucide-react";
import { AttendanceReport } from "./AttendanceReport";

export function AttendanceScanner() {
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<{ status: 'success' | 'error', msg: string } | null>(null);
  
  // Control de vistas: scanner, reporte o agenda
  const [view, setView] = useState<'scanner' | 'report' | 'agenda'>('scanner');
  
  // Estados para la Agenda
  const [meetings, setMeetings] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Obtenemos la fecha de hoy en Perú
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const hoyPeru = new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    // 1. Buscar si hay reunión HOY
    const { data: hoyData } = await supabase
      .from("meetings")
      .select("*")
      .eq("scheduled_date", hoyPeru)
      .maybeSingle();
      
    if (hoyData) setCurrentMeeting(hoyData);

    // 2. Cargar la agenda completa (reuniones desde hoy en adelante)
    const { data: agendaData } = await supabase
      .from("meetings")
      .select("*")
      .gte("scheduled_date", hoyPeru)
      .order("scheduled_date", { ascending: true });
      
    if (agendaData) setMeetings(agendaData);
    setLoading(false);
  };

  const handleScan = async (scannedText: string) => {
    if (!currentMeeting) return;
    const { error } = await supabase.from("attendance").insert({
      meeting_id: currentMeeting.id,
      catechist_id: scannedText
    });

    if (error) {
      if (error.code === '23505') setLastScan({ status: 'error', msg: "¡Ya registrado hoy!" });
      else setLastScan({ status: 'error', msg: "Código inválido." });
    } else {
      new Audio("https://actions.google.com/sounds/v1/ui/beep_short_on.ogg").play().catch(() => {});
      setLastScan({ status: 'success', msg: "¡Asistencia registrada!" });
    }
    setTimeout(() => setLastScan(null), 2000);
  };

  const programarReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("meetings").insert({
      title: newTitle,
      scheduled_date: newDate
    });
    setSaving(false);
    
    if (error) {
      alert("Error al programar la reunión");
    } else {
      setNewTitle("");
      setNewDate("");
      fetchData(); // Recargamos para que aparezca en la lista
    }
  };

  const eliminarReunion = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta reunión programada?")) return;
    await supabase.from("meetings").delete().eq("id", id);
    fetchData();
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
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button 
          onClick={() => setView(currentMeeting ? 'scanner' : 'scanner')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${view === 'scanner' || view === 'report' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          <Camera size={16} className="inline mr-2" /> Escáner de Hoy
        </button>
        <button 
          onClick={() => setView('agenda')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${view === 'agenda' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          <Calendar size={16} className="inline mr-2" /> Programar Agenda
        </button>
      </div>

      {/* VISTA 1: AGENDA (Para programar las reuniones) */}
      {view === 'agenda' && (
        <div className="animate-in fade-in">
          <h3 className="font-display text-xl text-primary mb-4">Programar Nueva Reunión</h3>
          <form onSubmit={programarReunion} className="space-y-3 mb-8 bg-secondary/30 p-4 rounded-2xl border border-border">
            <input required type="text" placeholder="Título (Ej: Reunión Catequistas)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
            <input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-gold" />
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-gradient-gold text-primary font-semibold flex items-center justify-center gap-2">
              <Plus size={16} /> {saving ? "Guardando..." : "Agregar a la Agenda"}
            </button>
          </form>

          <h3 className="font-display text-lg text-primary mb-3">Próximas Reuniones</h3>
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay reuniones programadas.</p>
          ) : (
            <div className="space-y-2">
              {meetings.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-semibold text-sm text-primary">{m.title}</p>
                    <p className="text-xs text-gold font-mono">{new Date(m.scheduled_date + 'T12:00:00').toLocaleDateString("es-PE")}</p>
                  </div>
                  <button onClick={() => eliminarReunion(m.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: ESCÁNER / REPORTE */}
      {(view === 'scanner' || view === 'report') && (
        <>
          {!currentMeeting ? (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                <ListTodo size={28} />
              </div>
              <h3 className="font-display text-xl text-primary font-semibold">Sin actividades para hoy</h3>
              <p className="text-sm text-muted-foreground px-4">
                No hay reuniones para la fecha actual. Ve a la pestaña "Programar Agenda" para añadir una.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-gold border-b border-border pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block font-normal">Reunión de Hoy:</span>
                  <span className="truncate block text-primary text-sm font-display">{currentMeeting.title}</span>
                </div>
                <button onClick={() => setView(view === 'scanner' ? 'report' : 'scanner')} className="px-3 py-1.5 bg-secondary text-primary rounded-lg hover:bg-border transition-colors">
                  {view === 'scanner' ? "Ver Reporte" : "Volver al Escáner"}
                </button>
              </div>

              {view === 'scanner' ? (
                <div className="rounded-2xl overflow-hidden border-4 border-secondary aspect-square relative shadow-inner bg-black">
                  <Scanner onResult={(text) => handleScan(text)} options={{ delayBetweenScanSuccess: 2000 }} />
                  {lastScan && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-sm z-10 animate-in fade-in ${
                      lastScan.status === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'
                    }`}>
                      {lastScan.status === 'success' ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
                      <p className="font-bold text-lg mt-2 px-4 text-center">{lastScan.msg}</p>
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
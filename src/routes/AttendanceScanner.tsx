import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, XCircle, Play, Users, Camera, FileText } from "lucide-react";
import { AttendanceReport } from "./AttendanceReport"; // Asegúrate de tener el componente de reporte en el mismo folder

export function AttendanceScanner() {
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [lastScan, setLastScan] = useState<{ status: 'success' | 'error', msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const defaultTitle = `Reunión - ${new Date().toLocaleDateString("es-PE", { day: 'numeric', month: 'short' })}`;

  const iniciarReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from("meetings")
      .insert({ title: meetingTitle.trim() || defaultTitle })
      .select()
      .single();

    setLoading(false);
    if (error) { alert("Error al iniciar reunión"); return; }
    if (data) setCurrentMeeting(data);
  };

  const handleScan = async (scannedText: string) => {
    if (!currentMeeting) return;

    const { error } = await supabase.from("attendance").insert({
      meeting_id: currentMeeting.id,
      catechist_id: scannedText
    });

    if (error) {
      if (error.code === '23505') setLastScan({ status: 'error', msg: "¡Ya registrado hoy!" });
      else setLastScan({ status: 'error', msg: "Código no reconocido." });
    } else {
      new Audio("https://actions.google.com/sounds/v1/ui/beep_short_on.ogg").play().catch(() => {});
      setLastScan({ status: 'success', msg: "¡Asistencia registrada!" });
    }
    setTimeout(() => setLastScan(null), 2000);
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-card max-w-md mx-auto">
      {!currentMeeting ? (
        <form onSubmit={iniciarReunion} className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-2">
            <Users size={28} />
          </div>
          <h3 className="font-display text-2xl text-primary">Control de Asistencia</h3>
          <input 
            type="text" 
            placeholder={defaultTitle}
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-center"
          />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-gold font-semibold">
            {loading ? "Iniciando..." : "Iniciar Escáner"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-gold">
            <span>{currentMeeting.title}</span>
            <div className="flex gap-2">
              <button onClick={() => setShowReport(!showReport)} className="text-primary hover:underline">
                {showReport ? "Escáner" : "Ver Reporte"}
              </button>
              <button onClick={() => { setCurrentMeeting(null); setShowReport(false); }} className="text-destructive hover:underline">Terminar</button>
            </div>
          </div>

          {!showReport ? (
            <div className="rounded-2xl overflow-hidden border-4 border-secondary aspect-square relative shadow-inner">
              <Scanner onResult={(text) => handleScan(text)} options={{ delayBetweenScanSuccess: 2000 }} />
              {lastScan && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-sm z-10 ${
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
    </div>
  );
}
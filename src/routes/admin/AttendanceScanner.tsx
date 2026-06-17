import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, XCircle, Calendar, Camera, Loader2 } from "lucide-react";
import { AttendanceReport } from "./AttendanceReport";

export function AttendanceScanner() {
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<{ status: 'success' | 'error', msg: string } | null>(null);
  const [showReport, setShowReport] = useState(false);

  // AL CARGAR: El sistema detecta la fecha de hoy y busca si hay una reunión programada
  useEffect(() => {
    const buscarReunionDeHoy = async () => {
      setLoading(true);
      
      // Obtenemos la fecha de hoy en formato YYYY-MM-DD (Zonal Perú)
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset();
      const hoyPeru = new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("scheduled_date", hoyPeru)
        .maybeSingle(); // Busca si existe exactamente una para hoy

      if (data) {
        setCurrentMeeting(data);
      }
      setLoading(false);
    };

    buscarReunionDeHoy();
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="animate-spin text-gold mb-2" size={32} />
        <p className="text-sm">Sincronizando agenda del día…</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-card max-w-md mx-auto">
      
      {/* CASO A: No hay ninguna reunión programada para la fecha de hoy */}
      {!currentMeeting ? (
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <h3 className="font-display text-xl text-primary font-semibold">Sin actividades para hoy</h3>
          <p className="text-sm text-muted-foreground px-4">
            No se encontró ninguna reunión programada en el calendario para la fecha de hoy. 
            Asegúrate de registrar las sesiones previamente en la base de datos.
          </p>
        </div>
      ) : (
        
        /* CASO B: Hay una reunión programada, el escáner se activa solo */
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-gold border-b border-border pb-3">
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block font-normal">Reunión Detectada:</span>
              <span className="truncate block text-primary text-sm font-display">{currentMeeting.title}</span>
            </div>
            <button 
              onClick={() => setShowReport(!showReport)} 
              className="px-3 py-1.5 bg-secondary text-primary rounded-lg hover:bg-border transition-colors shrink-0"
            >
              {showReport ? "Ver Cámara" : "Ver Reporte"}
            </button>
          </div>

          {!showReport ? (
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

          {!showReport && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <Camera size={14} className="text-gold" /> El escáner está activo y escuchando códigos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
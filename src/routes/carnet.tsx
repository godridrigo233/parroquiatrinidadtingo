import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { User, Search, ShieldCheck } from "lucide-react";
import { encryptQR } from "@/utils/crypto"; 

export const Route = createFileRoute("/carnet")({
  component: CarnetDigital,
});

function CarnetDigital() {
  const [code, setCode] = useState("");
  const [catechist, setCatechist] = useState<{ id: string; full_name: string } | null>(null);
  const [error, setError] = useState("");
  
  const buscarCarnet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Buscamos por el código personalizado (ej: CAT-01)
    const { data } = await supabase
      .from("catechists")
      .select("id, full_name")
      .eq("code", code.trim().toUpperCase())
      .single();
    
    if (data) setCatechist(data);
    else setError("Código no encontrado. Verifica con tu coordinador.");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-elegant text-center">
        {!catechist ? (
          <form onSubmit={buscarCarnet}>
            <div className="mx-auto w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-6">
              <User size={32} />
            </div>
            <h1 className="font-display text-3xl text-primary mb-2">Mi Carnet</h1>
            <p className="text-sm text-muted-foreground mb-6">Ingresa tu código personal para generar tu QR de asistencia.</p>
            
            <input required type="text" placeholder="Ej: CAT-01" value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl border border-input focus:border-gold outline-none mb-4 uppercase" />
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
              <Search size={18} className="inline mr-2"/> Generar QR
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h2 className="font-display text-2xl text-primary mb-1">{catechist.full_name}</h2>
            <p className="text-xs font-mono text-muted-foreground uppercase mb-6">ID: {code.toUpperCase()}</p>
            
            {/* EL CAMBIO CLAVE: Aquí aplicamos la función encryptQR al ID */}
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-secondary shadow-sm mb-4">
              <QRCodeSVG value={encryptQR(catechist.id)} size={200} level="H" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 flex flex-col items-center gap-1.5">
              <span className="flex items-center gap-1 text-green-600 font-semibold text-xs tracking-wide uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <ShieldCheck size={14} /> Código Encriptado
              </span>
              Toma una captura de pantalla a este código.
            </p>
            
            <button onClick={() => setCatechist(null)} className="text-sm text-muted-foreground underline hover:text-foreground transition-colors">
              Salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
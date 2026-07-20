import { useState, useEffect } from "react";
import { BookOpen, Heart, MessageCircle, ArrowRight } from "lucide-react";

export function EvangelioDelDiaCard() {
  const [fechaHoy, setFechaHoy] = useState("");

  useEffect(() => {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    const fecha = new Date().toLocaleDateString('es-PE', opciones);
    setFechaHoy(fecha.charAt(0).toUpperCase() + fecha.slice(1));
  }, []);
  const urlLecturasOficiales = "https://www.vaticannews.va/es/evangelio-de-hoy.html";

  const compartirEnWhatsApp = () => {
    const texto = `¡Paz y bien! 🌿 Te comparto el Evangelio de hoy (${fechaHoy}) desde la web de nuestra Parroquia Santísima Trinidad de Tingo: ${window.location.href}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <div className="bg-gradient-to-br from-[#1e2a5e] via-[#162048] to-[#0f1736] text-white rounded-3xl p-6 sm:p-8 shadow-elegant border-2 border-gold/40 relative overflow-hidden my-8">
      
      {/* Brillo suave de fondo para darle un toque acogedor */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between space-y-6">
        
        {/* Encabezado afectuoso con insignia de fecha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gold text-primary flex items-center justify-center font-bold shadow-md shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold block">
                ✝️ Alimento para el alma
              </span>
              <h3 className="font-display text-2xl font-semibold text-white">
                El Evangelio del Día
              </h3>
            </div>
          </div>
          
          <div className="self-start sm:self-center bg-white/10 text-white/90 text-xs sm:text-sm px-4 py-1.5 rounded-full border border-white/20 font-medium">
            📅 {fechaHoy || "Hoy"}
          </div>
        </div>

        {/* Mensaje de acogida pastoral */}
        <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/10 space-y-2">
          <p className="text-base sm:text-lg text-white/95 leading-relaxed font-display italic">
            «La Palabra de Dios ilumina nuestro camino y consuela nuestro corazón. Dedica unos minutitos de tu día para escuchar lo que Jesús quiere decirte hoy.»
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs sm:text-sm text-gold">
            <Heart size={14} className="fill-gold shrink-0" />
            <span className="font-medium">Unidos en oración con los Padres Carmelitas (CMI)</span>
          </div>
        </div>

        {/* Botones de Acción: Grandes, claros y fáciles de tocar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          
          {/* BOTÓN PRINCIPAL GIGANTE */}
          <a
            href={urlLecturasOficiales}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-gold text-primary font-bold text-base sm:text-lg text-center shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group select-none"
          >
            <BookOpen size={20} className="shrink-0" />
            <span>Leer el Evangelio de Hoy</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
          </a>

          {/* BOTÓN DE WHATSAPP AMIGABLE */}
          <button
            onClick={compartirEnWhatsApp}
            type="button"
            title="Enviar a un familiar o grupo de oración"
            className="py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 shrink-0 select-none"
          >
            <MessageCircle size={20} className="fill-white/20 shrink-0" />
            <span>Compartir por WhatsApp</span>
          </button>

        </div>

      </div>
    </div>
  );
}
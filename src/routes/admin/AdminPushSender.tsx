"use client";
import { useState } from "react";
import { Bell, Send, Sparkles, AlertTriangle, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AdminPushSender() {
  const [title, setTitle] = useState("🔔 Aviso Parroquial");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/#noticias");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Plantillas rápidas para facilitarle la vida a la secretaria
  const aplicarPlantilla = (tipo: string) => {
    if (tipo === "misa") {
      setTitle("⛪ Recordatorio de Misa — Sede Central");
      setBody("Iniciamos la celebración eucarística en 30 minutos. ¡Te esperamos en familia!");
      setUrl("/#horarios");
    } else if (tipo === "cambio") {
      setTitle("⚠️ Aviso Importante — Cambio de Lugar");
      setBody("Por refacciones en el templo, la misa de hoy se celebrará en el salón parroquial.");
      setUrl("/#noticias");
    } else if (tipo === "fiesta") {
      setTitle("🎉 ¡Misa de Fiesta Solemne!");
      setBody("Hoy celebramos con gran gozo la fiesta de nuestra patrona. Acompáñanos a las 6:00 PM.");
      setUrl("/#noticias");
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      alert("Por favor escribe el mensaje que deseas enviar a la comunidad.");
      return;
    }

    const confirmar = confirm(
      `¿Estás seguro de enviar este aviso a TODOS los celulares suscritos de la parroquia?\n\nTítulo: ${title}\nMensaje: ${body}`
    );
    if (!confirmar) return;

    setLoading(true);
    setLastResult(null);

    try {
      // Llamamos a la Edge Function de Supabase que dispara las notificaciones
      const { data, error } = await supabase.functions.invoke("enviar-push-masivo", {
        body: {
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/",
        },
      });

      if (error) throw error;

      setLastResult(`¡Éxito! El aviso fue enviado correctamente a los dispositivos suscritos.`);
      setBody(""); // Limpiamos el mensaje
    } catch (error: any) {
      console.error("Error al enviar push masivo:", error);
      alert(`Ocurrió un error al enviar: ${error.message || "Error de conexión"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-card max-w-2xl mx-auto">
      <div className="flex items-center gap-3 pb-5 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-[#0F1B2D] text-gold flex items-center justify-center shadow-md">
          <Bell size={24} className="animate-pulse" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Disparador de Avisos Push</h3>
          <p className="text-xs text-muted-foreground">Envía notificaciones en tiempo real al celular de los feligreses</p>
        </div>
      </div>

      {/* Botones de plantillas rápidas */}
      <div className="py-4 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          ⚡ Plantillas rápidas:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => aplicarPlantilla("misa")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-colors"
          >
            <Clock size={13} className="text-gold" /> Recordatorio de Misa
          </button>
          <button
            type="button"
            onClick={() => aplicarPlantilla("cambio")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-colors"
          >
            <AlertTriangle size={13} className="text-amber-500" /> Cambio / Urgente
          </button>
          <button
            type="button"
            onClick={() => aplicarPlantilla("fiesta")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-colors"
          >
            <Sparkles size={13} className="text-gold" /> Misa de Fiesta
          </button>
        </div>
      </div>

      <form onSubmit={handleSendPush} className="space-y-4 pt-2">
        {/* Título del Aviso */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Título de la notificación:
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. 🔔 Aviso Parroquial — Tingo"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Mensaje principal */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Mensaje (Cuerpo del aviso): *
          </label>
          <textarea
            rows={3}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escribe aquí lo que leerán los feligreses en su pantalla de bloqueo..."
            className="w-full p-3.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors resize-none"
          />
          <span className="text-[11px] text-muted-foreground block text-right">
            {body.length} caracteres (se recomiendan menos de 120)
          </span>
        </div>

        {/* URL al tocar */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground block">
            ¿A qué sección irán al tocar el aviso en su celular?
          </label>
          <select
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:border-gold"
          >
            <option value="/#noticias">Noticias y Eventos (#noticias)</option>
            <option value="/#horarios">Horarios de Misa (#horarios)</option>
            <option value="/#parroquia">Sobre la Parroquia (#parroquia)</option>
            <option value="/">Inicio de la web (/)</option>
          </select>
        </div>

        {/* Mensaje de éxito si lo hubo */}
        {lastResult && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{lastResult}</span>
          </div>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send size={18} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Disparando notificaciones a la nube..." : "🚀 Enviar Aviso a toda la Comunidad"}</span>
        </button>
      </form>
    </div>
  );
}
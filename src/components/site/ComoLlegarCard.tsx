import { useState } from "react";
import { MapPin, Navigation, Bus, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export function ComoLlegarCard() {
  const [showBuses, setShowBuses] = useState(false);

  // Enlaces directos con la ubicación de la Parroquia de Tingo
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=Parroquia+Santísima+Trinidad+Tingo+Arequipa";
  const wazeUrl = "https://waze.com/ul?q=Parroquia%20Santisima%20Trinidad%20Tingo%20Arequipa&navigate=yes";

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
          <Navigation size={20} />
        </div>
        <div>
          <h3 className="font-display text-lg text-primary font-semibold leading-tight">
            ¿Cómo llegar al templo?
          </h3>
          <p className="text-xs text-muted-foreground">
            Elige tu aplicación de navegación preferida
          </p>
        </div>
      </div>

      {/* Botones de GPS rápidos */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-primary font-semibold text-xs transition-all border border-border/60"
        >
          <span>Google Maps</span>
          <ExternalLink size={13} className="opacity-60" />
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#33ccff]/10 hover:bg-[#33ccff]/20 text-[#0099cc] font-semibold text-xs transition-all border border-[#33ccff]/30"
        >
          <span>Waze</span>
          <ExternalLink size={13} className="opacity-60" />
        </a>
      </div>

      {/* Sección Desplegable para Transporte Público (SIT Arequipa) */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowBuses(!showBuses)}
          className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-primary hover:text-gold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Bus size={15} className="text-gold" />
            Líneas de transporte público (SIT)
          </span>
          {showBuses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBuses && (
          <div className="mt-3 space-y-2 text-xs text-muted-foreground bg-secondary/40 p-3.5 rounded-xl border border-border/60 animate-in fade-in-50 duration-200">
            <p className="font-medium text-foreground">
              Buses con destino a Jacobo Hunter / Balneario de Tingo:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground/90 pl-1">
              <li>
                <strong className="text-foreground">Cuenca 10 (SIT):</strong> Buses de color granate/rojo que bajan por la Av. Alfonso Ugarte o Av. Las Américas.
              </li>
              <li>
                <strong className="text-foreground">Desde el Centro / Avelino:</strong> Tomar las unidades que indican "Hunter - Tingo - Pampas del Cusco" o "Mansión de Juan Pablo".
              </li>
              <li>
                <strong className="text-foreground">Paradero de bajada:</strong> Pedir bajar en el "Cruce de Tingo" o frente al Balneario (a solo 2 cuadras de la parroquia).
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
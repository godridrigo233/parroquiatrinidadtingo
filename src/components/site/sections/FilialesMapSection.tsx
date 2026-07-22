"use client";
import { useState } from "react";
import { MapPin, Bus, Clock, Navigation, Sparkles, AlertCircle } from "lucide-react";

interface ChapelGeo {
  id: string;
  name: string;
  address: string;
  schedule: string;
  lat: number;
  lng: number;
  busStop: string;
  sitInstructions: string;
}

const CHAPELS_GEO: ChapelGeo[] = [
  {
    id: "main",
    name: "Sede Central: Parroquia Santísima Trinidad",
    address: "Calle Ferrocarril 200, Av. Alfonso Ugarte, Tingo - Cercado",
    schedule: "Dom: 8:00 AM y 6:00 PM | Lun–Sáb: 6:00 PM",
    lat: -16.4358,
    lng: -71.5512,
    busStop: "Paradero 'Cruce de Tingo' (frente al parque principal)",
    sitInstructions: "Tomar el Bus SIT Cuenca 10 (color rojo/granate) con destino a Jacobo Hunter o Balneario de Jesús. Bajar en el Cruce de Tingo y caminar 2 cuadras por la Calle Ferrocarril.",
  },
  {
    id: "merced",
    name: "Capilla María de la Merced",
    address: "Ampliación Pampa del Cusco, Tingo",
    schedule: "Domingos: 6:00 PM",
    lat: -16.4410,
    lng: -71.5485,
    busStop: "Paradero Entrada Pampa del Cusco",
    sitInstructions: "Tomar el Bus SIT Cuenca 10 por Av. Alfonso Ugarte hasta el desvío de Pampa del Cusco. Subir por la vía principal de la ampliación.",
  },
  {
    id: "fatima",
    name: "Capilla Virgen de Fátima",
    address: "Pampa del Cusco, Tingo",
    schedule: "Domingos: 10:00 AM",
    lat: -16.4395,
    lng: -71.5460,
    busStop: "Paradero Central Pampa del Cusco",
    sitInstructions: "Unidades del SIT con ruta hacia Pampa del Cusco / Hunter. El templo se ubica en la zona media urbana de la comunidad.",
  },
  {
    id: "carmen",
    name: "Capilla Virgen del Carmen",
    address: "Plaza Principal de Tingo Grande",
    schedule: "Domingos: 12:00 PM",
    lat: -16.4480,
    lng: -71.5540,
    busStop: "Paradero Plaza de Tingo Grande",
    sitInstructions: "Bus SIT Cuenca 10 directo hasta la plaza de Tingo Grande. La capilla se encuentra ubicada frente al parque de la plaza.",
  },
];

export function FilialesMapSection() {
  const [selected, setSelected] = useState<ChapelGeo>(CHAPELS_GEO[0]);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  const openWaze = (lat: number, lng: number) => {
    window.open(`https://ul.waze.com/ul?ll=${lat},${lng}&navigate=yes`, "_blank");
  };

  return (
    <section id="radar-sit" className="py-16 bg-[#F0F4F8] border-t border-b border-[#CBD5E1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A45C]/15 text-[#0F1B2D] text-xs font-semibold uppercase tracking-wider mb-2">
            <Bus size={14} className="text-[#C8A45C]" />
            <span>Guía Logística y Geoespacial</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#0F1B2D]">
            Red Territorial y Transporte SIT
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Descubre cómo llegar fácilmente en transporte público o vehículo particular a nuestra Sede Central y Capillas Filiales.
          </p>
        </div>

        {/* Selector Rápido de Capillas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          {CHAPELS_GEO.map((item) => {
            const isSelected = selected.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0F1B2D] text-white border-[#C8A45C] shadow-lg scale-[1.02]"
                    : "bg-white text-[#1A2940] border-[#CBD5E1] hover:border-[#C8A45C] hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <MapPin size={14} className={isSelected ? "text-[#C8A45C]" : "text-slate-400"} />
                  <span className="uppercase tracking-wider text-[10px]">
                    {item.id === "main" ? "Sede Central" : "Capilla Filial"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold line-clamp-1 mt-0.5">
                  {item.name.replace("Capilla ", "").replace("Sede Central: ", "")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tarjeta de Navegación y Rutas */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] shadow-xl overflow-hidden grid md:grid-cols-12">
          
          {/* Panel Izquierdo: Información de Transporte y Horarios (5 columnas en PC) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-[#0F1B2D] text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C8A45C] text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles size={14} />
                <span>Navegación Asistida</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-6">
                {selected.name}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#C8A45C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-300">Dirección Física:</p>
                    <p className="text-white/90 mt-0.5">{selected.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[#C8A45C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-300">Horarios de Misa:</p>
                    <p className="text-white/90 mt-0.5 font-medium text-gold">{selected.schedule}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-2">
                    <div className="flex items-center gap-2 text-[#C8A45C] font-bold text-xs">
                      <Bus size={16} />
                      <span>Ruta SIT — Cuenca 10 (Rojo)</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-300 uppercase font-semibold">Paradero recomendado:</p>
                      <p className="text-xs text-white font-medium">{selected.busStop}</p>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1 border-t border-white/10">
                      {selected.sitInstructions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción GPS */}
            <div className="mt-8 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                onClick={() => openGoogleMaps(selected.lat, selected.lng)}
                className="py-3 px-3 rounded-xl bg-[#C8A45C] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#B8943E] transition-all shadow-md active:scale-95"
              >
                <Navigation size={14} />
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => openWaze(selected.lat, selected.lng)}
                className="py-3 px-3 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-white/20 transition-all active:scale-95"
              >
                <span>Waze GPS</span>
              </button>
            </div>
          </div>

          {/* Panel Derecho: Mapa Interactivo / Visualizador de Ruta (7 columnas en PC) */}
          <div className="md:col-span-7 p-6 sm:p-8 bg-[#F8FAFC] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
                <h4 className="font-bold text-sm text-[#0F1B2D] uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-[#C8A45C]" />
                  <span>Ubicación en el Mapa de Arequipa</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  GPS: {selected.lat}, {selected.lng}
                </span>
              </div>

              {/* Contenedor Visual del Mapa (Aquí puedes incrustar tu iframe de Google Maps o Leaflet) */}
              <div className="w-full h-[280px] sm:h-[340px] bg-slate-200 rounded-2xl overflow-hidden border border-[#CBD5E1] relative group shadow-inner flex items-center justify-center">
                {/* Iframe dinámico de Google Maps apuntando a las coordenadas */}
                <iframe
                  title={`Mapa de ${selected.name}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${selected.lat},${selected.lng}&z=16&output=embed`}
                  allowFullScreen
                />
              </div>

              {/* Nota de conexión con la otra sección */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-3 rounded-xl border border-slate-200/60">
                <AlertCircle size={16} className="text-[#C8A45C] shrink-0" />
                <span>
                  ¿Quieres conocer los coros, catequistas y grupos que sirven en esta capilla? Revisa nuestra sección superior de <strong>Comunidad y Ministerios</strong>.
                </span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#CBD5E1] flex justify-between items-center text-[11px] text-slate-400">
              <span>Jurisdicción Parroquial de Tingo</span>
              <span className="font-semibold text-[#0F1B2D]">Padres Carmelitas CMI</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
import { Youtube, ExternalLink, Sparkles, Play } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

// Componente para el ícono de TikTok
export function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.49V8.67a8.21 8.21 0 0 0 4.91 1.61V6.85a4.83 4.83 0 0 1-1-.16z" />
    </svg>
  );
}

const YOUTUBE_VIDEO_ID = "AZG4COJy9MQ";
const YOUTUBE_VIDEO_URL = `https://youtu.be/${YOUTUBE_VIDEO_ID}?si=AnCM6gOXQaATDMHk`;
const TIKTOK_URL = "https://www.tiktok.com/@p.santisimatrinidadtingo?_r=1&_t=ZS-99TwHvEUaQf";

export default function VideoSemanalSection() {
  return (
    <section id="videos" className="py-20 px-5 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Luz ambiental sutil de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Encabezado de Sección */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 mb-3">
              <Sparkles size={12} className="text-gold" />
              Contenido Audiovisual
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-tight">
              Canal Parroquial y Videos
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Acompaña nuestras reflexiones, transmisiones, homilías y actividades pastorales a través de nuestras plataformas audiovisuales.
            </p>
          </div>
        </Reveal>

        {/* Tarjeta Principal de Video (Inspirada en el Arzobispado de Arequipa) */}
        <Reveal delay={150}>
          <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/80 shadow-elegant overflow-hidden transition-all duration-300 hover:border-gold/30">
            <div className="grid lg:grid-cols-12 gap-0 items-stretch">
              
              {/* Columna de Video Embebido (16:9 responsivo) */}
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative group min-h-[260px] sm:min-h-[340px] md:min-h-[400px]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="Video destacado - Parroquia Santísima Trinidad de Tingo"
                  className="w-full h-full min-h-[260px] sm:min-h-[340px] md:min-h-[400px] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {/* Columna de Información y Botones */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-card">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block" />
                    Video Destacado
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-card-foreground leading-snug">
                    Parroquia Santísima Trinidad · Tingo
                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Te invitamos a ver este mensaje de nuestra comunidad y a suscribirte para seguir creciendo juntos en la fe y la devoción en Arequipa.
                  </p>

                  <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground/80 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Play size={12} className="text-gold" />
                      Disponible en alta definición en YouTube.
                    </p>
                  </div>
                </div>

                {/* Botones de Redes Sociales / Llamado a la acción */}
                <div className="mt-6 pt-6 border-t border-border/60 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                  <a
                    href={YOUTUBE_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                  >
                    <Youtube size={17} />
                    <span>Ver en YouTube</span>
                    <ExternalLink size={13} className="opacity-70 ml-0.5" />
                  </a>

                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#010101] hover:bg-black text-white font-medium text-xs sm:text-sm border border-white/20 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                  >
                    <TikTokIcon className="w-4 h-4 text-white" />
                    <span>Síguenos en TikTok</span>
                    <ExternalLink size={13} className="opacity-70 ml-0.5" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

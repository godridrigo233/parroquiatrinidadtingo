import { useState, useEffect, useCallback, useRef } from "react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Share2, Download, X } from "lucide-react";

export type GalleryImage = {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string;
  sort_order?: number;
};

interface ProcessedImage {
  id: string;
  src: string;
  label: string;
  category: string;
}

const defaultGalleryImgs: ProcessedImage[] = [
  { id: "1", src: "/assets/gallery-primera-comunion-misa.jpg", label: "Eucaristía", category: "Sacramentos" },
  { id: "2", src: "/assets/gallery-ninos-primera-comunion.jpg", label: "Niños de Eucaristía", category: "Sacramentos" },
  { id: "3", src: "/assets/gallery-bendicion-ninos.jpg", label: "Bendición de los niños", category: "Vida Parroquial" },
  { id: "4", src: "/assets/gallery-comunidad-oracion.jpg", label: "Comunidad en oración", category: "Vida Parroquial" },
  { id: "5", src: "/assets/gallery-confirmacion-jovenes.jpg", label: "Catequistas", category: "Sacramentos" },
  { id: "6", src: "/assets/gallery-peregrinos-esperanza.jpg", label: "Peregrinos de Esperanza · Jubileo 2025", category: "Eventos" },
  { id: "7", src: "/assets/gallery-alas-de-fe.jpg", label: "Ministerio Alas de Fe", category: "Ministerios" },
  { id: "8", src: "/assets/gallery-siervos-de-luz.jpg", label: "Ministerio Siervos de Luz", category: "Ministerios" },
  { id: "9", src: "/assets/gallery-hermandad-dolores.jpg", label: "Hermandad Virgen de los Dolores", category: "Ministerios" },
];

type SpanType = "wide" | "tall" | "normal" | "featured";
const SPAN_PATTERN: SpanType[] = [
  "featured",
  "normal",
  "tall",
  "normal",
  "normal",
  "wide",
  "normal",
  "normal",
  "normal",
];

function getSpanClass(type: SpanType): string {
  switch (type) {
    case "featured": return "col-span-2 row-span-2";
    case "wide":     return "col-span-2 row-span-1";
    case "tall":     return "col-span-1 row-span-2";
    default:         return "col-span-1 row-span-1";
  }
}

function getImgHeight(type: SpanType): string {
  switch (type) {
    case "featured": return "h-[420px] sm:h-[480px]";
    case "wide":     return "h-[220px]";
    case "tall":     return "h-[420px] sm:h-[460px]";
    default:         return "h-[200px] sm:h-[220px]";
  }
}

// Configuración de paginación
const IMAGES_PER_PAGE = 12; // Carga más imágenes por lote
const MAX_IMAGES = 48; // Límite máximo para evitar sobrecarga

export default function GaleriaSection({ gallery }: { gallery?: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(IMAGES_PER_PAGE);
  const [filmstripStart, setFilmstripStart] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const allItems: ProcessedImage[] = gallery && gallery.length > 0
    ? gallery
        .slice(0, MAX_IMAGES) // Limitar cantidad máxima
        .map((g, i) => ({
          id: g.id || String(i),
          src: g.image_url,
          label: g.title || "Fotografía Parroquial",
          category: g.category || "Vida Parroquial",
        }))
    : defaultGalleryImgs;

  const itemsToDisplay = allItems.slice(0, visibleCount);
  const hasMoreImages = allItems.length > visibleCount && visibleCount < MAX_IMAGES;
  const totalImages = Math.min(allItems.length, MAX_IMAGES);

  // Navegación lightbox
  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + itemsToDisplay.length) % itemsToDisplay.length
    );
  }, [itemsToDisplay.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % itemsToDisplay.length
    );
  }, [itemsToDisplay.length]);

  // Cargar más imágenes
  const loadMoreImages = useCallback(() => {
    if (isLoading || !hasMoreImages) return;
    
    setIsLoading(true);
    // Simular carga asíncrona para mejor UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + IMAGES_PER_PAGE, MAX_IMAGES));
      setIsLoading(false);
    }, 300);
  }, [hasMoreImages, isLoading]);

  // Intersection Observer para carga automática al hacer scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMoreImages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreImages();
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreImages, isLoading, loadMoreImages]);

  // Filmstrip
  const FILMSTRIP_VISIBLE = 5;
  useEffect(() => {
    if (lightboxIndex === null) return;
    const half = Math.floor(FILMSTRIP_VISIBLE / 2);
    const maxStart = Math.max(0, itemsToDisplay.length - FILMSTRIP_VISIBLE);
    const ideal = lightboxIndex - half;
    setFilmstripStart(Math.min(Math.max(0, ideal), maxStart));
  }, [lightboxIndex, itemsToDisplay.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  const shareWhatsApp = (item: ProcessedImage) => {
    const text = `✝️ Mira esta fotografía de la Parroquia Santísima Trinidad de Tingo: "${item.label}"\n${window.location.origin}${item.src}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadImage = (src: string, label: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${label.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeItem = lightboxIndex !== null ? itemsToDisplay[lightboxIndex] : null;
  const filmstripItems = itemsToDisplay.slice(filmstripStart, filmstripStart + FILMSTRIP_VISIBLE);

  return (
    <section id="galeria" className="py-24 px-5 lg:px-8 bg-secondary/40 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ENCABEZADO */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="h-px w-12 bg-gold/40 block" />
            <p className="text-gold uppercase tracking-[0.3em] text-[11px] font-bold">
              Comunidad en imágenes
            </p>
            <span className="h-px w-12 bg-gold/40 block" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight">
            Galería Parroquial
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Momentos de fe, comunidad y esperanza vividos en la Parroquia Santísima Trinidad de Tingo.
          </p>
        </Reveal>

        {/* CONTADOR */}
        <Reveal className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card/60 border border-border/50 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse inline-block" />
            {totalImages} fotografías en la colección
            {totalImages < (gallery?.length || 0) && (
              <span className="text-gold text-[10px]">(mostrando {totalImages})</span>
            )}
          </span>
        </Reveal>

        {/* MOSAICO */}
        <Reveal className="mt-12">
          {itemsToDisplay.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto gap-3 sm:gap-4">
                {itemsToDisplay.map((item, index) => {
                  const spanType = SPAN_PATTERN[index % SPAN_PATTERN.length];
                  const spanClass = getSpanClass(spanType);
                  const heightClass = getImgHeight(spanType);

                  return (
                    <div
                      key={item.id}
                      className={`${spanClass} group relative overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 cursor-pointer`}
                      onClick={() => setLightboxIndex(index)}
                    >
                      <div className={`${heightClass} w-full overflow-hidden`}>
                        <OptimizedImage
                          src={`${item.src}?v=1`}
                          alt={item.label}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      </div>

                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-400 flex flex-col justify-end p-4 sm:p-5 ${
                          spanType === "featured" ? "opacity-80 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gold mb-1.5 w-fit">
                          <span className="w-1 h-1 rounded-full bg-gold inline-block" />
                          {item.category}
                        </span>
                        <p className={`text-white font-display font-medium leading-snug ${
                          spanType === "featured" ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
                        }`}>
                          {item.label}
                        </p>
                        {spanType === "featured" && (
                          <p className="text-white/50 text-[11px] mt-2 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                            Ampliar fotografía
                          </p>
                        )}
                      </div>

                      <span className="absolute top-3 right-3 text-[10px] font-mono text-white/30 tabular-nums leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Punto de control para scroll infinito */}
              {hasMoreImages && (
                <div ref={loadMoreRef} className="mt-8 text-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3 py-4">
                      <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Cargando más imágenes...</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={loadMoreImages}
                      className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-gold hover:text-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer border-0"
                    >
                      <span>Ver más recuerdos</span>
                      <span className="w-5 h-5 rounded-full bg-background/10 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                        <ChevronRight size={13} />
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Mensaje de colección completa */}
              {!hasMoreImages && allItems.length > 0 && (
                <div className="mt-10 text-center">
                  <p className="text-xs text-muted-foreground/60 border-t border-border/30 pt-6">
                    ✝️ Has visto toda la colección · {allItems.length} fotografías
                  </p>
                </div>
              )}

              {allItems.length === 0 && (
                <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border text-muted-foreground text-sm">
                  No hay fotografías disponibles por el momento.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border text-muted-foreground text-sm">
              No hay fotografías disponibles por el momento.
            </div>
          )}
        </Reveal>
      </div>

      {/* LIGHTBOX - mismo código que antes */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/98 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden sm:rounded-3xl">
          <DialogTitle className="sr-only">Visor de fotografía parroquial</DialogTitle>

          {activeItem && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">
                    {activeItem.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 tabular-nums">
                    {String(lightboxIndex! + 1).padStart(2, "0")} / {String(itemsToDisplay.length).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => setLightboxIndex(null)}
                    className="ml-2 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[45vh] max-h-[60vh]">
                {itemsToDisplay.length > 1 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 sm:left-4 z-40 p-2.5 rounded-full bg-white/8 text-white/70 hover:bg-gold hover:text-black border border-white/15 hover:border-gold transition-all shadow-lg cursor-pointer"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <OptimizedImage
                    key={activeItem.id}
                    src={activeItem.src}
                    alt={activeItem.label}
                    className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-250"
                  />
                </div>

                {itemsToDisplay.length > 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-3 sm:right-4 z-40 p-2.5 rounded-full bg-white/8 text-white/70 hover:bg-gold hover:text-black border border-white/15 hover:border-gold transition-all shadow-lg cursor-pointer"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>

              {itemsToDisplay.length > 1 && (
                <div className="px-5 pt-3 pb-2 border-t border-white/8">
                  <div className="flex items-center justify-center gap-2">
                    {filmstripItems.map((thumb, fi) => {
                      const realIndex = filmstripStart + fi;
                      const isActive = realIndex === lightboxIndex;
                      return (
                        <button
                          key={thumb.id}
                          type="button"
                          onClick={() => setLightboxIndex(realIndex)}
                          className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                            isActive
                              ? "border-gold shadow-[0_0_0_2px_rgba(var(--gold-rgb),0.3)] scale-105"
                              : "border-transparent opacity-40 hover:opacity-70 hover:scale-102"
                          }`}
                          style={{ width: 56, height: 40 }}
                          aria-label={`Ver ${thumb.label}`}
                        >
                          <OptimizedImage
                            src={`${thumb.src}?v=1`}
                            alt={thumb.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                    {itemsToDisplay.length > filmstripStart + FILMSTRIP_VISIBLE && (
                      <button
                        type="button"
                        onClick={() => setFilmstripStart((s) => Math.min(s + FILMSTRIP_VISIBLE, itemsToDisplay.length - FILMSTRIP_VISIBLE))}
                        className="w-14 h-10 rounded-lg border border-white/20 text-white/40 hover:text-white/70 hover:border-white/40 transition-all text-xs flex items-center justify-center cursor-pointer bg-white/5"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-t border-white/10">
                <div>
                  <p className="text-white font-display text-lg font-medium leading-tight">
                    {activeItem.label}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{activeItem.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => shareWhatsApp(activeItem)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-semibold transition-all border border-[#25D366]/30 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>Compartir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(activeItem.src, activeItem.label)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/8 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
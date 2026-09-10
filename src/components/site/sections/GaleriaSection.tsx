import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  "featured", "normal", "tall", "normal", "normal",
  "wide", "normal", "normal", "normal",
];

function getDesktopSpanClass(type: SpanType): string {
  switch (type) {
    case "featured": return "md:col-span-2 md:row-span-2";
    case "wide":     return "md:col-span-2 md:row-span-1";
    case "tall":     return "md:col-span-1 md:row-span-2";
    default:         return "md:col-span-1 md:row-span-1";
  }
}

function getDesktopImgHeight(type: SpanType): string {
  switch (type) {
    case "featured": return "md:h-[460px]";
    case "wide":     return "md:h-[220px]";
    case "tall":     return "md:h-[460px]";
    default:         return "md:h-[220px]";
  }
}

const INITIAL_BATCH = 8;
const BATCH_STEP = 8;
const MAX_IMAGES = 60;

export default function GaleriaSection({ gallery }: { gallery?: GalleryImage[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");

  // Swipe tracking refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Filmstrip scroll ref
  const filmstripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  // Filter scroll shadow tracking
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [filterCanScrollRight, setFilterCanScrollRight] = useState(false);
  const [filterCanScrollLeft, setFilterCanScrollLeft] = useState(false);

  const allItems: ProcessedImage[] = useMemo(() => {
    return gallery && gallery.length > 0
      ? gallery.slice(0, MAX_IMAGES).map((g, i) => ({
          id: g.id || String(i),
          src: g.image_url,
          label: g.title || "Fotografía Parroquial",
          category: g.category || "Vida Parroquial",
        }))
      : defaultGalleryImgs;
  }, [gallery]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((item) => { if (item.category) set.add(item.category); });
    return ["Todas", ...Array.from(set)];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Todas") return allItems;
    return allItems.filter((item) => item.category === selectedCategory);
  }, [allItems, selectedCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(INITIAL_BATCH);
  };

  const itemsToDisplay = filteredItems.slice(0, visibleCount);
  const hasMoreImages = filteredItems.length > visibleCount;
  const remainingCount = filteredItems.length - visibleCount;

  // ── Lightbox navigation with animation direction tracking ──
  const handlePrev = useCallback(() => {
    setAnimDir("left");
    setAnimKey((k) => k + 1);
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + itemsToDisplay.length) % itemsToDisplay.length
    );
  }, [itemsToDisplay.length]);

  const handleNext = useCallback(() => {
    setAnimDir("right");
    setAnimKey((k) => k + 1);
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % itemsToDisplay.length
    );
  }, [itemsToDisplay.length]);

  // ── Load more: instant, no fake setTimeout ──
  const loadMoreImages = () => {
    if (!hasMoreImages) return;
    setVisibleCount((prev) => prev + BATCH_STEP);
  };

  // ── Touch/Swipe handlers for lightbox ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only trigger if horizontal swipe dominates and exceeds 45px threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > deltaY * 1.5) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [handleNext, handlePrev]);

  // ── Keyboard navigation ──
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

  // ── Auto-scroll filmstrip to keep active thumb visible ──
  useEffect(() => {
    if (lightboxIndex === null || !activeThumbRef.current || !filmstripRef.current) return;
    activeThumbRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [lightboxIndex]);

  // ── Filter scroll shadow detection ──
  useEffect(() => {
    const el = filterScrollRef.current;
    if (!el) return;
    const check = () => {
      setFilterCanScrollLeft(el.scrollLeft > 8);
      setFilterCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [categories]);

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

  // Preload next and prev images when lightbox is open
  const preloadNext = lightboxIndex !== null ? itemsToDisplay[(lightboxIndex + 1) % itemsToDisplay.length] : null;
  const preloadPrev = lightboxIndex !== null ? itemsToDisplay[(lightboxIndex - 1 + itemsToDisplay.length) % itemsToDisplay.length] : null;

  return (
    <section id="galeria" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/40 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ENCABEZADO */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-10 bg-gold/40 block" />
            <p className="text-gold uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">
              Comunidad en imágenes
            </p>
            <span className="h-px w-10 bg-gold/40 block" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight">
            Galería Parroquial
          </h2>
          <p className="mt-2.5 text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Momentos de fe, comunidad y esperanza vividos en la Parroquia Santísima Trinidad de Tingo.
          </p>
        </Reveal>

        {/* FILTROS POR CATEGORÍA — con sombras indicadoras de scroll */}
        <Reveal className="mt-8">
          <div className="relative">
            {/* Sombra izquierda */}
            <div
              className={`pointer-events-none absolute left-0 top-0 h-full w-10 z-10 bg-gradient-to-r from-secondary/80 to-transparent transition-opacity duration-300 ${filterCanScrollLeft ? "opacity-100" : "opacity-0"}`}
            />
            {/* Sombra derecha */}
            <div
              className={`pointer-events-none absolute right-0 top-0 h-full w-10 z-10 bg-gradient-to-l from-secondary/80 to-transparent transition-opacity duration-300 ${filterCanScrollRight ? "opacity-100" : "opacity-0"}`}
            />
            <div
              ref={filterScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none"
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = cat === "Todas" ? allItems.length : allItems.filter(i => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-gold text-black shadow-md shadow-gold/20 scale-105"
                        : "bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      isActive ? "bg-black/15 text-black font-bold" : "bg-muted text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* CONTADOR RESUMEN */}
        <div className="mt-3 text-center">
          <span className="text-[11px] text-muted-foreground/80">
            Mostrando {itemsToDisplay.length} de {filteredItems.length} fotografías
            {selectedCategory !== "Todas" && ` en ${selectedCategory}`}
          </span>
        </div>

        {/* MOSAICO */}
        <Reveal className="mt-8">
          {itemsToDisplay.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto gap-2.5 sm:gap-4">
                {itemsToDisplay.map((item, index) => {
                  const spanType = SPAN_PATTERN[index % SPAN_PATTERN.length];
                  const desktopSpanClass = getDesktopSpanClass(spanType);
                  const desktopHeightClass = getDesktopImgHeight(spanType);

                  return (
                    <div
                      key={item.id}
                      className={`col-span-1 ${desktopSpanClass} group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
                      onClick={() => setLightboxIndex(index)}
                    >
                      {/* width/height explícitos para evitar CLS */}
                      <div className={`aspect-[4/3] ${desktopHeightClass} w-full overflow-hidden relative`}>
                        <OptimizedImage
                          src={`${item.src}?v=1`}
                          alt={item.label}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>

                      {/* Capa de información superpuesta */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 opacity-90 sm:opacity-0 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold mb-1 w-fit">
                          <span className="w-1 h-1 rounded-full bg-gold inline-block" />
                          {item.category}
                        </span>
                        <p className="text-white font-display font-medium text-xs sm:text-base leading-snug line-clamp-2">
                          {item.label}
                        </p>
                      </div>

                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] font-mono text-white/40 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm select-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BOTÓN "VER MÁS" — sin setTimeout falso */}
              {hasMoreImages && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={loadMoreImages}
                    className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-foreground text-background text-xs sm:text-sm font-semibold hover:bg-gold hover:text-foreground transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102 cursor-pointer border-0"
                  >
                    <span>Ver {remainingCount} fotografías más</span>
                    <span className="w-5 h-5 rounded-full bg-background/10 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                      <ChevronRight size={13} />
                    </span>
                  </button>
                </div>
              )}

              {/* FIN DE COLECCIÓN */}
              {!hasMoreImages && allItems.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-xs text-muted-foreground/60 border-t border-border/30 pt-6">
                    ✝️ Has explorado todas las {filteredItems.length} fotografías {selectedCategory !== "Todas" ? `en ${selectedCategory}` : ""}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border text-muted-foreground text-sm">
              No hay fotografías disponibles en esta categoría.
            </div>
          )}
        </Reveal>
      </div>

      {/* VISOR LIGHTBOX CON SWIPE + PRELOAD + ALTURA MEJORADA */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/98 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden sm:rounded-3xl">
          <DialogTitle className="sr-only">Visor de fotografía parroquial</DialogTitle>

          {/* Preload oculto de imágenes adyacentes */}
          {preloadNext && (
            <img src={preloadNext.src} alt="" aria-hidden="true" className="sr-only absolute pointer-events-none" />
          )}
          {preloadPrev && (
            <img src={preloadPrev.src} alt="" aria-hidden="true" className="sr-only absolute pointer-events-none" />
          )}

          {activeItem && (
            <div className="flex flex-col h-full">
              {/* Barra superior */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
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

              {/* Área de imagen — altura mejorada con dvh para evitar teclado virtual */}
              <div
                className="relative flex-1 flex items-center justify-center p-3 sm:p-6 min-h-[55dvh] max-h-[72dvh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {itemsToDisplay.length > 1 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 z-40 p-2 sm:p-2.5 rounded-full bg-white/10 text-white/80 hover:bg-gold hover:text-black border border-white/15 transition-all shadow-lg cursor-pointer"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Imagen con animación de dirección correcta via key único */}
                <div
                  key={`${activeItem.id}-${animKey}`}
                  className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
                    animDir === "right"
                      ? "animate-in fade-in slide-in-from-right-8 duration-250"
                      : "animate-in fade-in slide-in-from-left-8 duration-250"
                  }`}
                >
                  <OptimizedImage
                    src={activeItem.src}
                    alt={activeItem.label}
                    width={1200}
                    height={900}
                    className="max-h-[68dvh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                  />
                </div>

                {itemsToDisplay.length > 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 z-40 p-2 sm:p-2.5 rounded-full bg-white/10 text-white/80 hover:bg-gold hover:text-black border border-white/15 transition-all shadow-lg cursor-pointer"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* FILMSTRIP SCROLLABLE COMPLETO */}
              {itemsToDisplay.length > 1 && (
                <div className="px-4 pt-2 pb-2 border-t border-white/8">
                  <div
                    ref={filmstripRef}
                    className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none"
                  >
                    {itemsToDisplay.map((thumb, idx) => {
                      const isActive = idx === lightboxIndex;
                      return (
                        <button
                          key={thumb.id}
                          ref={isActive ? activeThumbRef : null}
                          type="button"
                          onClick={() => {
                            setAnimDir(idx > (lightboxIndex ?? 0) ? "right" : "left");
                            setAnimKey((k) => k + 1);
                            setLightboxIndex(idx);
                          }}
                          className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 cursor-pointer border-2 ${
                            isActive
                              ? "border-gold scale-110 shadow-md shadow-gold/30"
                              : "border-transparent opacity-35 hover:opacity-75 hover:scale-105"
                          }`}
                          style={{ width: 52, height: 38 }}
                          aria-label={`Ver ${thumb.label}`}
                        >
                          <OptimizedImage
                            src={`${thumb.src}?v=1`}
                            alt={thumb.label}
                            width={104}
                            height={76}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Barra inferior: info + acciones */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3.5 border-t border-white/10">
                <div>
                  <p className="text-white font-display text-base sm:text-lg font-medium leading-tight">
                    {activeItem.label}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{activeItem.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => shareWhatsApp(activeItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-semibold transition-all border border-[#25D366]/30 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>Compartir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(activeItem.src, activeItem.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
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

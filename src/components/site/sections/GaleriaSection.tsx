import { useState, useEffect, useCallback } from "react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Share2, Download, X, Filter } from "lucide-react";

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

export default function GaleriaSection({ gallery }: { gallery?: GalleryImage[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Normalización de datos
  const allItems: ProcessedImage[] = gallery && gallery.length > 0
    ? gallery.map((g, i) => ({
        id: g.id || String(i),
        src: g.image_url,
        label: g.title || "Fotografía Parroquial",
        category: g.category || "Vida Parroquial",
      }))
    : defaultGalleryImgs;

  // Extracción dinámica de categorías
  const categories = ["Todos", ...Array.from(new Set(allItems.map((item) => item.category)))];

  // Filtrado de imágenes
  const filteredItems = selectedCategory === "Todos"
    ? allItems
    : allItems.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  // Limitar imágenes mostradas para evitar scroll infinito
  const itemsToDisplay = filteredItems.slice(0, visibleCount);

  // Navegación en Lightbox
  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + itemsToDisplay.length) % itemsToDisplay.length));
  }, [lightboxIndex, itemsToDisplay.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % itemsToDisplay.length));
  }, [lightboxIndex, itemsToDisplay.length]);

  // Soporte para teclado en Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  // Compartir en WhatsApp
  const shareWhatsApp = (item: ProcessedImage) => {
    const text = `✝️ Mira esta fotografía de la Parroquia Santísima Trinidad de Tingo: "${item.label}"\n${window.location.origin}${item.src}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Descarga directa
  const downloadImage = (src: string, label: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${label.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeItem = lightboxIndex !== null ? itemsToDisplay[lightboxIndex] : null;

  return (
    <section id="galeria" className="py-24 px-5 lg:px-8 bg-secondary/40">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold flex items-center justify-center gap-1.5">
            Comunidad en imágenes
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium text-foreground">
            Galería Parroquial
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Recuerdos y momentos de fe compartidos en la Parroquia Santísima Trinidad de Tingo.
          </p>
        </Reveal>

        {/* FILTROS POR CATEGORÍA */}
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground mr-2 font-medium">
              <Filter size={13} /> Filtrar:
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setLightboxIndex(null);
                    setVisibleCount(8); // Resetear a 8 fotos al cambiar de categoría
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all select-none border cursor-pointer ${
                    isActive
                      ? "bg-gold text-primary-foreground border-gold shadow-md scale-105"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* MASONRY GRID */}
        <Reveal className="mt-10">
          {itemsToDisplay.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {itemsToDisplay.map((item, index) => (
                <div
                  key={item.id}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold rounded-2xl block overflow-hidden"
                  >
                    <OptimizedImage
                      src={`${item.src}?v=1`}
                      alt={item.label}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                      <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <p className="text-white font-display text-base font-medium leading-snug">
                        {item.label}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
              No hay fotografías disponibles en esta categoría por el momento.
            </div>
          )}
        </Reveal>

        {/* BOTÓN "VER MÁS" */}
        {filteredItems.length > visibleCount && (
          <Reveal className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-6 py-3 rounded-full bg-gold text-primary-foreground text-sm font-semibold shadow-md hover:shadow-elegant hover:scale-105 transition-all cursor-pointer border-0"
            >
              Ver más recuerdos
            </button>
          </Reveal>
        )}
      </div>

      {/* LIGHTBOX */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-white/10 shadow-2xl backdrop-blur-md overflow-hidden sm:rounded-3xl">
          <DialogTitle className="sr-only">Visor de fotografía parroquial</DialogTitle>
          
          {activeItem && (
            <div className="relative flex flex-col items-center justify-center min-h-[60vh] max-h-[85vh] p-4 sm:p-6 select-none">
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Cerrar visor"
              >
                <X size={20} />
              </button>

              {itemsToDisplay.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/50 text-white hover:bg-gold hover:text-black border border-white/20 transition-all shadow-lg cursor-pointer"
                  aria-label="Fotografía anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className="relative w-full h-full flex items-center justify-center max-h-[68vh] overflow-hidden">
                <OptimizedImage
                  src={activeItem.src}
                  alt={activeItem.label}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                />
              </div>

              {itemsToDisplay.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-black/50 text-white hover:bg-gold hover:text-black border border-white/20 transition-all shadow-lg cursor-pointer"
                  aria-label="Siguiente fotografía"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 border-t border-white/10 pt-3">
                <div className="text-center sm:text-left">
                  <p className="text-white font-display text-lg font-medium leading-none">
                    {activeItem.label}
                  </p>
                  <p className="text-xs text-gold mt-1">
                    {activeItem.category} • <span className="text-white/60">{lightboxIndex! + 1} de {itemsToDisplay.length}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shareWhatsApp(activeItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer border-0"
                  >
                    <Share2 size={13} />
                    <span>Compartir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(activeItem.src, activeItem.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
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
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type GalleryImage = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };

const galleryImgs = [
  { src: "/assets/gallery-primera-comunion-misa.jpg", label: "Primera Comunión" },
  { src: "/assets/gallery-ninos-primera-comunion.jpg", label: "Niños de Primera Comunión" },
  { src: "/assets/gallery-bendicion-ninos.jpg", label: "Bendición de los niños" },
  { src: "/assets/gallery-comunidad-oracion.jpg", label: "Comunidad en oración" },
  { src: "/assets/gallery-confirmacion-jovenes.jpg", label: "Catequistas" },
  { src: "/assets/gallery-peregrinos-esperanza.jpg", label: "Peregrinos de Esperanza · Jubileo 2025" },
  { src: "/assets/gallery-alas-de-fe.jpg", label: "Ministerio Alas de Fe" },
  { src: "/assets/gallery-siervos-de-luz.jpg", label: "Ministerio Siervos de Luz" },
  { src: "/assets/gallery-hermandad-dolores.jpg", label: "Hermandad Virgen de los Dolores" },
];

export default function GaleriaSection({ gallery }: { gallery: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<{ url: string; title?: string | null } | null>(null);

  const items = gallery.length
    ? gallery.map((g) => ({ id: g.id, src: g.image_url, label: g.title }))
    : galleryImgs.map((g, i) => ({ id: String(i), src: g.src, label: g.label }));

  return (
    <section id="galeria" className="py-24 px-5 lg:px-8 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Comunidad en imágenes</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Galería</h2>
        </Reveal>

        <Reveal className="mt-12">
          {items.length > 0 && (
            <Carousel opts={{ align: "start", loop: true }} className="relative px-10 sm:px-12">
              <CarouselContent className="-ml-4">
                {items.map((g) => (
                  <CarouselItem key={g.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <button type="button" onClick={() => setLightbox({ url: g.src, title: g.label })} className="group relative block w-full aspect-square overflow-hidden rounded-2xl shadow-card focus:outline-none focus:ring-2 focus:ring-gold">
                      <OptimizedImage src={`${g.src}?v=1`} alt={g.label ?? ""} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {g.label && (
                        <span className="absolute inset-x-0 bottom-0 p-3 text-white text-sm font-medium bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          {g.label}
                        </span>
                      )}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-card border-border" />
              <CarouselNext className="right-0 bg-card border-border" />
            </Carousel>
          )}
        </Reveal>
      </div>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
          {lightbox && (
            <div className="relative">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black">
                <OptimizedImage src={lightbox.url} alt={lightbox.title ?? ""} className="w-full h-full object-cover" />
              </div>
              {lightbox.title && <p className="mt-3 text-center text-white font-display text-xl drop-shadow">{lightbox.title}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

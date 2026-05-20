import { Facebook, ExternalLink } from "lucide-react";

const PAGE_URL = "https://www.facebook.com/parroquiasantisimatrinidadtingo";

export function FacebookFeed() {
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    PAGE_URL,
  )}&tabs=timeline&width=500&height=720&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <div className="relative mx-auto w-full max-w-[500px] rounded-2xl bg-card border border-border shadow-elegant overflow-hidden">
      {/* Fallback (visible si el iframe es bloqueado por adblockers) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-0">
        <Facebook className="text-primary mb-3" size={32} />
        <p className="font-display text-lg text-primary">Mira nuestras noticias en Facebook</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Si no ves los posts a continuación, tu navegador puede estar bloqueando el contenido de Facebook.
        </p>
        <a
          href={PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-card hover:shadow-elegant transition-shadow"
        >
          Abrir página oficial <ExternalLink size={14} />
        </a>
      </div>

      {/* Embed oficial de Facebook (Page Plugin) */}
      <iframe
        title="Publicaciones recientes en Facebook"
        src={src}
        loading="lazy"
        width={500}
        height={720}
        className="relative z-10 w-full h-[720px] border-0 bg-white"
        scrolling="no"
        allow="encrypted-media"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

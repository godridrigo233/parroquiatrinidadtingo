import { useEffect, useState } from "react";
import { Facebook, Calendar, Clock, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { AddToCalendar } from "@/components/site/AddToCalendar";

type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url?: string | null };

type FacebookPost = {
  id: string;
  image_url: string | null;
  post_url: string | null;
  description: string | null;
};

// 🛡️ SUBCOMPONENTE DE IMAGEN BLINDADO
// Si los servidores de Facebook o el CDN fallan con error 403, el estado cambia al instante a la foto parroquial
function FacebookImage({ src }: { src: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const fallbackImg = "https://images.unsplash.com/photo-1548625361-16a00e971cfd?q=80&w=600";

  return (
    <img
      src={imgSrc}
      loading="lazy"
      alt="Publicación de Facebook"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      onError={() => {
        if (imgSrc !== fallbackImg) {
          setImgSrc(fallbackImg);
        }
      }}
    />
  );
}

function FacebookPostsGrid() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFacebookFeed = async () => {
      try {
        const rssUrl = "https://fetchrss.com/feed/1wk26cD118cU1wk26x4gR7gD.rss"; 
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "ok" && data.items) {
          const formattedPosts = data.items.slice(0, 3).map((item: any) => {
            let rawImageUrl = item.enclosure?.link || item.thumbnail;
            
            if (!rawImageUrl && item.content) {
              const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch && imgMatch[1]) {
                rawImageUrl = imgMatch[1];
              }
            }

            // 1. LIMPIEZA CLAVE: Convertimos las entidades &amp; de vuelta a símbolos & reales
            const cleanUrl = rawImageUrl ? rawImageUrl.replace(/&amp;/g, '&') : null;

            // 2. ESCUDO WESERV: Pasamos la URL limpia por el proxy anti-403 para evitar bloqueos
            const finalImageUrl = cleanUrl 
              ? `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=600&output=webp` 
              : "https://images.unsplash.com/photo-1548625361-16a00e971cfd?q=80&w=600";

            const cleanDescription = (item.content || item.description || "")
              .replace(/<[^>]*>?/gm, '')
              .replace(/\(Feed generated with FetchRSS\)/gi, '')
              .trim() || "Mira nuestra última actividad o aviso parroquial en nuestra página oficial.";

            return {
              id: item.guid || item.link || Math.random().toString(),
              post_url: item.link || "https://www.facebook.com/parroquiasantisimatrinidadtingo",
              description: cleanDescription,
              image_url: finalImageUrl
            };
          });
          
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.warn("Feed de Facebook temporalmente en modo de enlace directo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacebookFeed();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-border shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-11/12" />
              <div className="h-3 bg-gray-200 rounded w-10/12" />
              <div className="h-3 bg-gray-200 rounded w-8/12" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-12 px-6 text-center">
        <p className="text-muted-foreground mb-4">Aún no hay publicaciones recientes.</p>
        <a
          href="https://www.facebook.com/parroquiasantisimatrinidadtingo/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold transition-colors"
        >
          <Facebook size={18} /> Visita nuestra página de Facebook
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.post_url ?? "https://www.facebook.com/parroquiasantisimatrinidadtingo/"}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col h-full rounded-2xl bg-white border border-border/60 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            {post.image_url ? (
              <FacebookImage src={post.image_url} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                <Facebook size={48} className="opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          <div className="flex flex-col flex-1 p-6 md:p-7">
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-6 line-clamp-4 flex-1">
              {post.description}
            </p>
            <div className="mt-auto w-full py-3 px-4 rounded-xl bg-primary/5 group-hover:bg-primary text-primary group-hover:text-primary-foreground font-semibold flex items-center justify-center gap-2 transition-colors duration-300">
              Ver publicación
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function EventosSection({
  events,
  loadingEvents,
}: {
  events: Eventt[];
  loadingEvents: boolean;
}) {
  return (
    <section id="noticias" className="py-24 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Vida parroquial</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Eventos y avisos</h2>
          </div>
          <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold inline-flex items-center gap-2 hover:text-gold transition-colors">
            <Facebook size={18} /> Síguenos en Facebook
          </a>
        </Reveal>

        {loadingEvents ? (
          <Reveal className="mt-10">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 w-full animate-pulse h-48" />
          </Reveal>
        ) : events.length > 0 && (
          <Reveal className="mt-10">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 shadow-elegant">
              <p className="uppercase tracking-[0.2em] text-xs text-gold font-semibold">Próximos eventos</p>
              <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((e) => {
                  const d = new Date(e.event_date);
                  return (
                    <div key={e.id} className="border-l-2 border-gold pl-4">
                      {e.image_url && (
                        <div className="mb-3 aspect-video w-full overflow-hidden rounded-xl">
                          <img src={e.image_url} alt={e.title} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="font-display text-xl">{e.title}</p>
                      <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                        <Calendar size={14} /> {d.toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
                        <span className="opacity-60">·</span>
                        <Clock size={14} /> {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {e.location && (
                        <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                          <MapPin size={14} /> {e.location}
                        </p>
                      )}
                      {e.description && <p className="text-sm text-primary-foreground/70 mt-2">{e.description}</p>}
                      <AddToCalendar event={e} />
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal className="mt-12">
          <h3 className="font-display text-2xl md:text-3xl text-primary mb-6">Últimas publicaciones</h3>
          <FacebookPostsGrid />
        </Reveal>

        <Reveal className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#25D366]/5 via-card to-card border border-[#25D366]/20 p-6 md:p-10 shadow-elegant group">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#25D366]/10 transition-colors duration-500" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-start gap-5">
                <div className="shrink-0 h-16 w-16 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.3)] group-hover:scale-105 transition-transform duration-300">
                  <MessageCircle size={32} fill="currentColor" className="text-white" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#25D366]/10 text-[#1e9e4b] text-xs font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                      Canal Oficial
                    </span>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl text-primary font-semibold tracking-tight">
                    Mantente conectado con nuestra comunidad!
                  </h3>

                  <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                    Únete para recibir de forma directa, instantánea y privada en tu celular:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-sm text-foreground/80 font-semibold">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-border/40">
                      <span className="text-base">🔔</span> Avisos Parroquiales
                    </div>
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-border/40">
                      <span className="text-base">📆</span> Horarios de Misa
                    </div>
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-border/40">
                      <span className="text-base">✨</span> Eventos Especiales
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto">
                <a
                  href="https://whatsapp.com/channel/0029Vb8tmDx90x2wWaZDB71a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full lg:w-auto px-8 py-4 rounded-2xl bg-[#25D366] text-white font-bold hover:bg-[#20ba59] shadow-[0_10px_25px_rgba(37,211,102,0.25)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300 active:translate-y-0 text-center select-none"
                >
                  Unirse al Canal de WhatsApp
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
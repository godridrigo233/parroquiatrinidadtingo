import { useEffect, useState } from "react";
import { Facebook, Calendar, Clock, MapPin, MessageCircle, ArrowRight, Megaphone } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { AddToCalendar } from "@/components/site/AddToCalendar";
import { getSupabaseImageUrl } from "@/lib/image-url";

type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url?: string | null };

function getProximityLabel(dateStr: string): string | null {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  // Evento ya empezó y no han pasado más de 60 min → "En curso"
  if (diffMinutes >= 0 && diffMinutes <= 60) return "En curso";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return null;
  if (diffDays === 0) return "Hoy";
  if (diffDays <= 7) return "Esta semana";
  return null;
}

type FacebookPost = {
  id: string;
  image_url: string | null;
  post_url: string | null;
  description: string | null;
};


import { supabase } from "@/integrations/supabase/client";

// 🛡️ SUBCOMPONENTE DE IMAGEN CON FALLBACK AUTOMÁTICO
function FacebookImage({ src }: { src: string }) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? "/assets/hero-church.webp" : imgSrc}
      loading="lazy"
      alt="Publicación parroquial de Facebook"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      onError={() => {
        if (!hasError) {
          if (imgSrc.includes("wsrv.nl") && src.includes("url=")) {
            const rawUrl = decodeURIComponent(src.split("url=")[1].split("&")[0]);
            setImgSrc(rawUrl);
          } else {
            setHasError(true);
          }
        }
      }}
    />
  );
}

const DEFAULT_FALLBACK_POSTS: FacebookPost[] = [
  {
    id: "fb-1",
    post_url: "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
    description: "🙏 Trabajos de mejora y mantenimiento en la Casa Parroquial. ¡Agradecemos su apoyo y colaboración comunitaria!",
    image_url: "/assets/hero-church.webp"
  },
  {
    id: "fb-2",
    post_url: "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
    description: "✝️ Acompañanos en nuestros horarios semanales de Misa y oración comunitaria en el templo de Tingo.",
    image_url: "/assets/gallery-comunidad-oracion.jpg"
  },
  {
    id: "fb-3",
    post_url: "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
    description: "🕊️ Infórmate sobre las inscripciones para bautismos, catequesis y servicios sacramentales.",
    image_url: "/assets/gallery-primera-comunion-misa.jpg"
  }
];

function FacebookPostsGrid() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFacebookFeed = async () => {
      try {
        // 1. Intentar consultar publicaciones guardadas en Supabase
        const { data: dbPosts, error: dbError } = await supabase
          .from("facebook_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!dbError && dbPosts && dbPosts.length > 0) {
          const formattedDbPosts = dbPosts.map((p) => ({
            id: String(p.id),
            post_url: p.post_url || "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
            description: p.description || "Publicación parroquial oficial de la Parroquia Santísima Trinidad de Tingo.",
            image_url: p.image_url || "/assets/hero-church.webp",
          }));
          setPosts(formattedDbPosts);
          setIsLoading(false);
          return;
        }

        // 2. Si no hay en Supabase, obtener del feed de RSS filtrando estrictamente fotos reales
        const rssUrl = "https://fetchrss.com/feed/1wk26cD118cU1wk26x4gR7gD.rss"; 
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);

        if (response.ok) {
          const data = await response.json();
          if (data.status === "ok" && data.items && data.items.length > 0) {
            const formattedPosts = data.items
              .filter((item: any) => {
                const link = (item.link || "").toLowerCase();
                const title = (item.title || "").toLowerCase();
                const content = (item.content || "").toLowerCase();

                // 🚫 Descartar videos, transmisiones en vivo y contenidos restringidos
                const isVideoOrLive = link.includes("/videos/") || link.includes("/watch") || link.includes("/reel") || link.includes("/live");
                const isUnavailable = title.includes("isn't available") || title.includes("no disponible") || content.includes("when this happens");
                const hasRealPhoto = !!(item.enclosure?.link || item.thumbnail || item.content?.includes("<img"));

                return hasRealPhoto && !isVideoOrLive && !isUnavailable;
              })
              .map((item: any) => {
                let rawImageUrl = item.enclosure?.link || item.thumbnail;
                if (!rawImageUrl && item.content) {
                  const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch && imgMatch[1]) {
                    rawImageUrl = imgMatch[1];
                  }
                }

                const cleanDescription = (item.content || item.description || "")
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/\(Feed generated with FetchRSS\)/gi, '')
                  .trim() || "Mira nuestra última actividad o aviso parroquial en nuestra página oficial de Facebook.";

                return {
                  id: item.guid || item.link || Math.random().toString(),
                  post_url: item.link || "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
                  description: cleanDescription,
                  image_url: rawImageUrl || "/assets/hero-church.webp"
                };
              })
              .slice(0, 3);

            setPosts(formattedPosts.length > 0 ? formattedPosts : DEFAULT_FALLBACK_POSTS);
            setIsLoading(false);
            return;
          }
        }

        setPosts(DEFAULT_FALLBACK_POSTS);
      } catch (error) {
        console.warn("Feed de Facebook temporalmente no disponible, usando respaldo:", error);
        setPosts(DEFAULT_FALLBACK_POSTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacebookFeed();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-2xl bg-card border border-border/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col p-3.5"
        >
          {/* Incrustación nativa de la publicación de Facebook */}
          <div className="flex-1 flex justify-center overflow-hidden rounded-xl bg-muted/20 min-h-[460px]">
            <iframe
              src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post.post_url ?? "https://www.facebook.com/parroquiasantisimatrinidadtingo/")}&show_text=true&width=350`}
              width="100%"
              height="480"
              style={{ border: "none", overflow: "hidden", minHeight: "480px", maxWidth: "360px" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title={post.description || "Publicación de Facebook"}
            />
          </div>

          {/* Botón interactivo directo a la publicación en Facebook */}
          <a
            href={post.post_url ?? "https://www.facebook.com/parroquiasantisimatrinidadtingo/"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3.5 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer group"
          >
            <Facebook size={14} className="text-[#1877F2] group-hover:text-white transition-colors" />
            <span>Ver publicación en Facebook</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
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
    
        </Reveal>

        {loadingEvents ? (
          <Reveal className="mt-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse">
                  <div className="aspect-video rounded-xl bg-white/10 mb-4" />
                  <div className="h-5 bg-white/10 rounded w-10/12 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-6/12 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-5/12" />
                </div>
              ))}
            </div>
          </Reveal>
        ) : events.length > 0 && (
          <Reveal className="mt-10">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0F1B2D] to-[#1A2940] text-primary-foreground p-8 shadow-elegant overflow-hidden">
              {/* Fondo decorativo */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <Megaphone size={16} className="text-gold" />
                  <p className="uppercase tracking-[0.2em] text-xs text-gold font-semibold">Próximos eventos</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {events.map((e, idx) => {
                    const d = new Date(e.event_date);
                    const proximity = getProximityLabel(e.event_date);
                    const isClosest = idx === 0 && !!proximity;
                    return (
                      <div
                        key={e.id}
                        className={`group relative border-l-3 pl-5 py-1 rounded-r-xl transition-colors duration-300 hover:bg-white/[0.07] ${
                          isClosest ? "border-gold" : "border-gold/40 hover:border-gold/70"
                        }`}
                      >
                        {proximity && (
                          <span className={`absolute -top-1 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-in fade-in zoom-in duration-200 ${
                            proximity === "En curso" ? "bg-emerald-500/20 text-emerald-300" :
                            proximity === "Hoy" ? "bg-red-500/20 text-red-300" : "bg-gold/20 text-gold"
                          }`}>
                            {proximity}
                          </span>
                        )}
                        {e.image_url && (
                          <div className="mb-3 aspect-video w-full overflow-hidden rounded-xl">
                            <img
                              src={getSupabaseImageUrl(e.image_url, { width: 600 })}
                              alt={e.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <p className="font-display text-xl">{e.title}</p>
                        <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                          <Calendar size={14} className="text-gold/70" /> {d.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                          <span className="opacity-40">·</span>
                          <Clock size={14} className="text-gold/70" /> {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {e.location && (
                          <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                            <MapPin size={14} className="text-gold/70" /> {e.location}
                          </p>
                        )}
                        {e.description && <p className="text-sm text-primary-foreground/80 mt-2 leading-relaxed">{e.description}</p>}
                        <AddToCalendar event={e} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Comunidad en redes</p>
              <h3 className="font-display text-3xl md:text-4xl text-primary font-medium mt-1">
                Novedades en Facebook
              </h3>
            </div>
            <a
              href="https://www.facebook.com/parroquiasantisimatrinidadtingo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all text-xs font-semibold w-fit shadow-sm"
            >
              <Facebook size={16} /> Página Oficial de Facebook ↗
            </a>
          </div>
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
                    ¡Mantente conectado con nuestra comunidad!
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
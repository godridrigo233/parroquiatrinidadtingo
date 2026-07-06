import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Church, Clock, BookOpen, Flame, Heart, Users, Music, GraduationCap,
  Sparkles, MapPin, Phone, Facebook, Instagram, Mail, Calendar, ArrowRight, Quote, Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { FacebookFeed } from "@/components/site/FacebookFeed";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DonacionesSection, DonationRow } from "@/components/site/DonacionesSection";
import { AddToCalendar } from "@/components/site/AddToCalendar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Preloader } from "@/components/ui/Preloader";
import * as Sentry from "@sentry/react";

const SITE_URL = "https://parroquiatrinidadtingo.vercel.app";
const HOME_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3432647d-43db-4a55-b562-41513493df53/id-preview-91ff1323--99ad5a9e-cbbf-4cb3-8a34-00165e03bf57.lovable.app-1779232569211.png";

Sentry.init({
  dsn: "https://8d2244a4f316e9ba59a1de0835a10373@o4511615179096064.ingest.us.sentry.io/4511615199019008",
  integrations: [],
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parroquia Santísima Trinidad · Tingo, Arequipa" },
      {
        name: "description",
        content:
          "Parroquia Santísima Trinidad de Tingo (Arequipa) — Carmelitas de María Inmaculada. Horarios de misa, sacramentos, devoción a Nuestra Señora de los Dolores y comunidad parroquial.",
      },
      { property: "og:title", content: "Parroquia Santísima Trinidad · Tingo" },
      {
        property: "og:description",
        content:
          "Comunidad católica viva en Tingo, Arequipa. Horarios, noticias, ministerios y devociones.",
      },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:image", content: HOME_OG_IMAGE },
      { name: "twitter:image", content: HOME_OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
  }),
  component: Home,
});

type Schedule = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
type Ministry = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null };
type GalleryImage = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };

const categoryMeta: Record<string, { label: string; icon: typeof Church }> = {
  misa: { label: "Santa Misa", icon: Church },
  confesion: { label: "Confesiones", icon: Heart },
  catequesis: { label: "Catequesis", icon: BookOpen },
  adoracion: { label: "Adoración", icon: Flame },
  pastoral: { label: "Consejo Parroquial", icon: Users },
  secretaria: { label: "Secretaría", icon: Briefcase },
};

const ministryIcons = [Music, BookOpen, Users, Sparkles, Heart, GraduationCap];

const ministryPhotos = [
  "/assets/ministries/alas-de-fe.png",
  "/assets/ministries/siervos-de-luz.png",
  "/assets/ministries/acolitos.png",
  "/assets/ministries/senor-de-los-milagros.png",
  "/assets/ministries/legion-de-maria.png",
  null,
];

const testimonios = [
  { text: "La parroquia es mi segundo hogar. Aquí encuentro paz y comunidad.", author: "María C." },
  { text: "Un excelente lugar para compartir experiencias de fe y crecer espiritualmente.", author: "Carlos M." },
  { text: "Lugar santo, las personas son muy amables y acogedoras.", author: "Lucía R." },
  { text: "Hermosa parroquia, muy bien ubicada. Excelente lugar para acercarse a Dios.", author: "José A." },
];

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

const sacerdotes = [
  {
    img: "/assets/padre-tommy.jpg",
    name: "Rvdo P. Tommy Varghese, CMI",
    role: "Párroco",
    desc: "Pastor de la comunidad, dedicado a la celebración de los sacramentos, la formación de los fieles y el acompañamiento espiritual de la familia parroquial.",
  },
  {
    img: "/assets/padre-manesh.jpg",
    name: "Padre Manesh Joseph, CMI",
    role: "Vicario parroquial",
    desc: "Colabora en la vida pastoral de la parroquia, animando los ministerios, la catequesis y la cercanía con los jóvenes y las familias.",
  },
];

function Home() {
  const [lightbox, setLightbox] = useState<{ url: string; title?: string | null } | null>(null);
  const [scrollY, setScrollY] = useState(0);
  
  // 👇 1. Estado para diferir la carga de Facebook y liberar el hilo principal del móvil
  const [loadFacebook, setLoadFacebook] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => window.matchMedia("(max-width: 768px)").matches;
    setIsMobile(checkMobile());

    const onScroll = () => {
      if (!checkMobile()) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 👇 2. Retrasar la inyección del feed iframe de Facebook 2.5 segundos
    const timer = setTimeout(() => setLoadFacebook(true), 2500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const staleConfig = { staleTime: 1000 * 60 * 15, gcTime: 1000 * 60 * 30 };

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["home_schedules"],
    queryFn: async () => {
      const { data } = await supabase.from("schedules").select("*").order("sort_order");
      return (data as Schedule[]) || [];
    },
    ...staleConfig
  });

  const { data: ministries = [], isLoading: loadingMinistries } = useQuery({
    queryKey: ["home_ministries"],
    queryFn: async () => {
      const { data } = await supabase.from("ministries").select("*").order("created_at");
      return (data as Ministry[]) || [];
    },
    ...staleConfig
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["home_events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date").limit(6);
      return (data as Eventt[]) || [];
    },
    ...staleConfig
  });

  const { data: gallery = [], isLoading: loadingGallery } = useQuery({
    queryKey: ["home_gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
      return (data as GalleryImage[]) || [];
    },
    ...staleConfig
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ["home_donations"],
    queryFn: async () => {
      const { data } = await supabase.from("donations_info" as any).select("*").order("sort_order");
      return ((data as unknown) as DonationRow[]) || [];
    },
    ...staleConfig
  });

  const globalLoading = loadingSchedules || loadingMinistries || loadingEvents || loadingGallery || loadingDonations;

  const groupedSchedules = schedules.reduce<Record<string, Schedule[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader isLoading={globalLoading} />
      <Navbar />

      {/* HERO SECTION */}
      <section id="inicio" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0 will-change-transform" style={{ transform: isMobile ? "none" : `translate3d(0, ${scrollY * 0.35}px, 0)` }}>
          <img
            src="/assets/hero-church.jpg"
            alt="Parroquia Santísima Trinidad"
            className="ken-burns absolute inset-0 h-[115%] w-full object-cover"
            fetchPriority="high"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.18_0.03_265/0.55)_75%,oklch(0.14_0.03_265/0.9)_100%)]" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto"
          style={{ transform: `translate3d(0, ${scrollY * -0.15}px, 0)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
          <span className="fade-up gold-divider text-white/90">
            <Sparkles size={14} className="text-gold" />
            <span>Arequipa · Perú</span>
          </span>
          <h1 className="fade-up fade-up-delay-1 hero-title-glow mt-7 font-display text-5xl md:text-7xl lg:text-[5.5rem] font-medium text-white leading-[1.02] tracking-tight">
            Parroquia<br />
            <span className="text-gold italic">Santísima Trinidad</span>
          </h1>
          <div className="fade-up fade-up-delay-2 mt-7 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center">
              <span className="h-px w-12 bg-gold/70" />
              <p className="px-5 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed italic font-display max-w-2xl">
                «Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.»
              </p>
              <span className="h-px w-12 bg-gold/70" />
            </div>
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold/90">Mateo 18, 20</span>
          </div>
          <div className="fade-up fade-up-delay-3 mt-11 flex flex-wrap gap-3 justify-center">
            <a href="#horarios" className="px-7 py-3.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-elegant hover:scale-105 transition-all flex items-center gap-2">
              <Clock size={18} /> Ver horarios
            </a>
            <a href="#noticias" className="px-7 py-3.5 rounded-full bg-white/10 border border-white/30 backdrop-blur text-white font-semibold hover:bg-white/20 transition-colors">
              Eventos
            </a>
            <a href="#contacto" className="px-7 py-3.5 rounded-full bg-white text-foreground font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
              Contacto <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] tracking-[0.35em] uppercase">Desliza</span>
          <span className="block h-10 w-px bg-gradient-to-b from-gold/80 to-transparent animate-pulse" />
        </div>
      </section>

      {/* SOBRE LA PARROQUIA */}
      <section id="parroquia" className="py-24 md:py-32 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              {/* 👇 Inyección de OptimizedImage para decodificación asíncrona */}
              <OptimizedImage src="/assets/church-interior.jpg" alt="Interior de la parroquia" className="rounded-2xl shadow-elegant w-full aspect-[4/5] object-cover" />
              <div className="absolute -bottom-8 -right-8 hidden md:block bg-card rounded-2xl shadow-card p-6 max-w-[220px] border border-border">
                <p className="font-display text-3xl text-gold">+50</p>
                <p className="text-sm text-muted-foreground mt-1">Años sembrando fe en Tingo</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Nuestra parroquia</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
              Una casa de oración<br />en el corazón de <span className="italic text-gold">Tingo</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              La Parroquia Santísima Trinidad es una comunidad católica acogedora ubicada en la entrada de Jacobo Hunter, animada pastoralmente por las <strong className="text-foreground">Carmelitas de María Inmaculada (CMI)</strong>. Aquí celebramos los sacramentos, formamos discípulos y servimos a la familia parroquial bajo la protección de Nuestra Señora de los Dolores.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {[
                { t: "Misión", d: "Anunciar el Evangelio y celebrar la fe." },
                { t: "Visión", d: "Ser comunidad viva, misionera y mariana." },
                { t: "Valores", d: "Fe, caridad, servicio y unidad." },
              ].map((v) => (
                <div key={v.t} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="font-display text-xl text-primary">{v.t}</p>
                  <p className="text-sm text-muted-foreground mt-2">{v.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SACERDOTES */}
      <section id="sacerdotes" className="py-24 md:py-28 px-5 lg:px-8 bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Al servicio de la comunidad</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Nuestros sacerdotes</h2>
          </Reveal>

          <div className="mt-16 grid sm:grid-cols-2 gap-8 md:gap-12">
            {sacerdotes.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <article className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-elegant transition-shadow will-change-transform">
                  <div className="aspect-[3/4] overflow-hidden">
                    <OptimizedImage
                      src={`${p.img}?v=1`}
                      alt={`${p.role} ${p.name}`}
                      className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 will-change-transform"
                    />
                  </div>
                  <div className="p-7">
                    <p className="text-gold uppercase tracking-[0.2em] text-xs font-semibold">{p.role}</p>
                    <h3 className="mt-2 font-display text-3xl text-primary">{p.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DEVOCIONES */}
      <section id="devociones" className="py-24 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Devociones</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Nuestra fe y espiritualidad</h2>
          </Reveal>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {[
              { img: "/assets/virgen-dolorosa.jpg", title: "Nuestra Señora de los Dolores", text: "Madre fiel que acompaña al pie de la cruz. La parroquia mantiene viva esta devoción mariana con el rezo del rosario y celebraciones especiales." },
              { img: "/assets/trinidad.jpg", title: "Santísima Trinidad", text: "Misterio central de nuestra fe: Padre, Hijo y Espíritu Santo. Bajo su nombre celebramos cada eucaristía y vivimos como comunidad." },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden shadow-elegant aspect-[4/5]">
                  <OptimizedImage src={`${d.img}?v=1`} alt={d.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-8 text-primary-foreground">
                    <h3 className="font-display text-3xl text-white">{d.title}</h3>
                    <p className="mt-3 text-sm text-white/85 leading-relaxed">{d.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MINISTERIOS */}
      <section id="ministerios" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Servir y caminar juntos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Ministerios y grupos</h2>
            <p className="mt-4 text-muted-foreground">Carismas al servicio de la comunidad parroquial.</p>
          </Reveal>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingMinistries ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Reveal key={`skel-min-${i}`} delay={i * 80}><SkeletonCard /></Reveal>
              ))
            ) : (
              ministries.map((m, i) => {
                const Icon = ministryIcons[i % ministryIcons.length];
                const ministryImage = m.image_url || ministryPhotos[i];
                return (
                  <Reveal key={m.id} delay={i * 80}>
                    <article className="group h-full flex flex-col bg-card rounded-2xl border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all overflow-hidden will-change-transform">
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                        {ministryImage && (
                          <OptimizedImage src={`${ministryImage}?v=1`} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform" />
                        )}
                        <span className="absolute top-3 left-3 h-9 w-9 rounded-lg bg-card/95 backdrop-blur flex items-center justify-center shadow-card">
                          <Icon size={16} className="text-gold" />
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-display text-2xl text-primary">{m.name}</h3>
                        {m.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.description}</p>}
                        {(m.leader || m.schedule) && (
                          <div className="mt-5 pt-5 border-t border-border space-y-1.5 text-sm">
                            {m.leader && <p className="text-foreground"><span className="text-muted-foreground">Encargado:</span> {m.leader}</p>}
                            {m.schedule && <p className="text-foreground flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {m.schedule}</p>}
                          </div>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section id="horarios" className="py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Vida sacramental</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Horarios parroquiales</h2>
          </Reveal>

          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {loadingSchedules ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Reveal key={`skel-horario-${i}`} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                  <div className="h-[280px] bg-card rounded-2xl p-7 border border-border flex flex-col animate-pulse">
                    <div className="h-14 w-14 rounded-xl bg-gray-200 mb-5" />
                    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-6" />
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              Object.entries(groupedSchedules)
                .filter(([cat]) => cat !== "catequesis")
                .map(([cat, items], i) => {
                  const meta = categoryMeta[cat] ?? { label: cat, icon: Church };
                  const Icon = meta.icon;
                  return (
                    <Reveal key={cat} delay={i * 80} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                      <div className="h-full bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-elegant transition-all group">
                        <div className="h-14 w-14 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground shadow-card group-hover:scale-110 transition-transform">
                          <Icon size={26} />
                        </div>
                        <h3 className="mt-5 font-display text-2xl text-primary">{meta.label}</h3>
                        <ul className="mt-4 space-y-3">
                          {items.map((it) => (
                            <li key={it.id} className="border-l-2 border-gold pl-3">
                              <p className="text-sm font-semibold text-foreground">{it.day_label}</p>
                              <p className="text-sm text-muted-foreground">{it.time_label}</p>
                              {it.notes && <p className="text-xs text-muted-foreground/80 italic mt-0.5">{it.notes}</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  );
                })
            )}
          </div>

          <Reveal className="mt-14 text-center">
            <Link to="/sacramentos" className="inline-flex items-center gap-3 px-9 py-4 text-lg rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-card hover:shadow-elegant transition-shadow">
              Ver requisitos de sacramentos <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Comunidad en imágenes</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Galería</h2>
          </Reveal>

          <Reveal className="mt-12">
            {(() => {
              const items = gallery.length
                ? gallery.map((g) => ({ id: g.id, src: g.image_url, label: g.title }))
                : galleryImgs.map((g, i) => ({ id: String(i), src: g.src, label: g.label }));
              if (!items.length) return null;
              return (
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
              );
            })()}
          </Reveal>
        </div>

        <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
          <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
            {lightbox && (
              <div className="relative">
                <OptimizedImage src={lightbox.url} alt={lightbox.title ?? ""} className="w-full max-h-[85vh] object-contain rounded-2xl bg-black" />
                {lightbox.title && <p className="mt-3 text-center text-white font-display text-xl drop-shadow">{lightbox.title}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>

      <DonacionesSection items={donations} />
      
      {/* NOTICIAS / AVISOS */}
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

          {/* 👇 CONTROL DEL PROCESADOR MÓVIL: Solo renderiza Facebook tras pasar el temporizador inicial */}
          <div className="mt-12 min-h-[350px] flex items-center justify-center">
            {loadFacebook ? (
              <FacebookFeed />
            ) : (
              <div className="text-xs text-muted-foreground animate-pulse flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span>Sincronizando últimas publicaciones...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-24 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Voces de la comunidad</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Testimonios</h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {testimonios.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <blockquote className="relative bg-card rounded-2xl p-8 border border-border shadow-card">
                  <Quote className="absolute top-5 right-5 text-gold/30" size={48} />
                  <p className="font-display text-xl leading-relaxed text-foreground/90 italic">«{t.text}»</p>
                  <footer className="mt-5 text-sm text-muted-foreground">— {t.author}</footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 px-5 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Visítanos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium text-white">Estamos aquí para ti</h2>
            <p className="mt-5 text-white/80 leading-relaxed max-w-lg">
              Las puertas de la parroquia están abiertas. Acércate, conversa con nosotros y forma parte de esta gran familia.
            </p>

            <div className="mt-6 p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-gold shrink-0"><Clock size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Horario de atención en secretaría</p>
                  <p className="text-white/75 text-sm">Lunes a sábado · 3:00 PM – 6:00 PM</p>
                </div>
              </div>
            </div>

            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><MapPin size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Dirección</p>
                  <p className="text-white/75 text-sm">Américas 1820, Arequipa 04011 — Entrada de Jacobo Hunter, Tingo</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><Phone size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Teléfono</p>
                  <a href="tel:+51915049850" className="text-white/75 text-sm hover:text-gold">+51 915 049 850</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><Facebook size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Facebook</p>
                  <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="text-white/75 text-sm hover:text-gold">@parroquiasantisimatrinidadtingo</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><Instagram size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Instagram</p>
                  <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="text-white/75 text-sm hover:text-gold">@stma_trinidad_tingo</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><Mail size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Correo</p>
                  <p className="text-white/75 text-sm">pstrinidadtingo@gmail.com</p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-2xl overflow-hidden shadow-elegant border border-white/10 aspect-[4/3] bg-white/5">
              <iframe title="Mapa parroquia" src="https://www.google.com/maps?q=Americas+1820,+Arequipa+04011,+Peru&output=embed" className="w-full h-full" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-foreground border-t border-white/10 py-12 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="" className="h-12 w-12" loading="lazy" />
              <div>
                <p className="font-display text-lg text-white">Santísima Trinidad</p>
                <p className="text-xs text-white/60 uppercase tracking-widest">Tingo · Arequipa</p>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Horarios y Contacto</p>
            
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>Domingos · 8:00 AM y 6:00 PM</li>
              <li>Lun – Vie · 6:00 PM</li>
              <li>Sábado · 6:00 PM (vigilia)</li>
            </ul>

            <div className="my-3 border-t border-white/10" />

            <ul className="space-y-2 text-sm text-white/75">
              <li>Secretaría: Lun – Sáb · 3:00 – 6:00 PM</li>
              <li>
                Tel: <a href="tel:+51915049850" className="hover:text-white hover:underline transition-colors">+51 915 049 850</a>{" "}
                <span className="text-white/50">(solo llamadas)</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Redes Sociales</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm">
                <Facebook size={16} /> Facebook
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm">
                <Instagram size={16} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Parroquia Santísima Trinidad de Tingo.
        </div>
      </footer>

      <WhatsAppFab />
    </div>
  );
}
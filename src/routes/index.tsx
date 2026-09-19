import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { ParishAIBotFab } from "@/components/site/ParishAIBotFab";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { DonationRow } from "@/components/site/sections/DonacionesSection";
import { Preloader } from "@/components/ui/Preloader";
import * as Sentry from "@sentry/react";
// Carga modular diferida (Lazy-loading / Code-splitting) para optimizar el rendimiento y evitar bloqueos
const AboutSection = lazy(() => import("@/components/site/sections/AboutSection"));
const SacramentosSection = lazy(() => import("@/components/site/sections/SacramentosSection"));
const HorariosSection = lazy(() => import("@/components/site/sections/HorariosSection"));
const GaleriaSection = lazy(() => import("@/components/site/sections/GaleriaSection"));
const VideoSemanalSection = lazy(() => import("@/components/site/sections/VideoSemanalSection"));
const DonacionesSection = lazy(() =>
  import("@/components/site/sections/DonacionesSection").then((m) => ({ default: m.DonacionesSection })),
);
const EventosSection = lazy(() => import("@/components/site/sections/EventosSection"));
const ContactoSection = lazy(() => import("@/components/site/sections/ContactoSection"));

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
    links: [
      { rel: "canonical", href: SITE_URL + "/" },
      { rel: "icon", type: "image/webp", href: "/assets/logo.webp" },
      { rel: "apple-touch-icon", href: "/assets/logo.webp" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Church",
          name: "Parroquia Santísima Trinidad de Tingo",
          description:
            "Comunidad católica animada por las Carmelitas de María Inmaculada (CMI) en Tingo, Arequipa, Perú.",
          url: SITE_URL + "/",
          image: HOME_OG_IMAGE,
          logo: SITE_URL + "/assets/logo.webp",
          telephone: "+51 915 049 850",
          email: "pstrinidadtingo@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado",
            addressLocality: "Arequipa",
            addressRegion: "Arequipa",
            addressCountry: "PE",
          },
          sameAs: [
            "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
            "https://www.instagram.com/stma_trinidad_tingo/",
            "https://www.youtube.com/watch?v=AZG4COJy9MQ",
            "https://www.tiktok.com/@p.santisimatrinidadtingo",
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Sunday",
              opens: "08:00",
              closes: "18:00",
              description: "Misas dominicales: 8:00 AM y 6:00 PM",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "18:00",
              closes: "19:00",
              description: "Misa diaria 6:00 PM",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "18:00",
              closes: "19:00",
              description: "Misa de vigilia 6:00 PM",
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

type Schedule = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
type Ministry = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url?: string | null };
type GalleryImage = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };

// Skeleton de respaldo con alturas aproximadas fijas para evitar saltos visuales (CLS)
function SectionSkeleton({ height = "h-[600px]" }: { height?: string }) {
  return (
    <div className={`w-full ${height} bg-muted animate-pulse rounded-xl my-6`} aria-hidden="true" />
  );
}

function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [greeting, setGreeting] = useState("Paz y Bien");
  const [massNotice, setMassNotice] = useState("Comunidad Católica Viva");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    if (hour >= 5 && hour < 12) {
      setGreeting("Buenos días · Paz y Bien");
    } else if (hour >= 12 && hour < 19) {
      setGreeting("Buenas tardes · Bienvenidos");
    } else {
      setGreeting("Buenas noches · Dios te bendiga");
    }

    if (day === 0) {
      setMassNotice("Hoy Domingo de Misa: 8:00 AM y 6:00 PM");
    } else if (day === 6) {
      setMassNotice("Hoy Misa de precepto: 6:00 PM");
    } else {
      setMassNotice("Hoy Santa Misa: 6:00 PM");
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => window.matchMedia("(max-width: 768px)").matches;
    setIsMobile(checkMobile());

    const onScroll = () => {
      if (!checkMobile()) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scroll suave al hash al cargar la página (ej: /#horarios)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "").trim();
    if (!hash) return;
    // Esperar a que las secciones lazy-loaded se rendericen
    const timeout = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const staleConfig = { staleTime: 1000 * 60 * 15, gcTime: 1000 * 60 * 30 };

  const { data: ministries = [], isLoading: loadingMinistries } = useQuery({
    queryKey: ["home_ministries"],
    queryFn: async () => {
      const { data } = await supabase.from("ministries").select("*").order("created_at");
      return (data as Ministry[]) || [];
    },
    ...staleConfig,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["home_events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date")
        .limit(6);
      return (data as Eventt[]) || [];
    },
    ...staleConfig,
  });

  const { data: gallery = [], isLoading: loadingGallery } = useQuery({
    queryKey: ["home_gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
      return (data as GalleryImage[]) || [];
    },
    ...staleConfig,
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ["home_donations"],
    queryFn: async () => {
      const { data } = await supabase.from("donations_info" as any).select("*").order("sort_order");
      return ((data as unknown) as DonationRow[]) || [];
    },
    ...staleConfig,
  });

  const { data: rawSchedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["home_schedules"],
    queryFn: async () => {
      const { data } = await supabase.from("schedules").select("*").order("sort_order");
      return (data as Schedule[]) || [];
    },
    ...staleConfig,
  });

  const groupedSchedules: Record<string, Schedule[]> = {};
  rawSchedules.forEach((s) => {
    if (!groupedSchedules[s.category]) groupedSchedules[s.category] = [];
    groupedSchedules[s.category].push(s);
  });

  const globalLoading = loadingMinistries || loadingEvents || loadingGallery || loadingDonations;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader isLoading={globalLoading} />
      <Navbar />

      {/* SECCIÓN HERO (Primer pantallazo — cargado de forma inmediata y prioritaria) */}
      <section id="inicio" className="relative h-[100svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: isMobile ? "none" : `translate3d(0, ${scrollY * 0.35}px, 0)` }}
        >
          <img
            src="/assets/hero-church.webp"
            alt="Fachada de la Parroquia Santísima Trinidad de Tingo al atardecer"
            className="ken-burns absolute inset-0 h-[115%] w-full object-cover"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Gradientes atmosféricos de profundidad con halo celestial */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f24]/80 via-[#0a0f24]/50 to-[#070a18]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18)_0%,rgba(10,15,36,0.6)_60%,rgba(7,10,24,0.95)_100%)]" />

        <div
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-5 sm:px-6 max-w-5xl mx-auto pt-16 sm:pt-0"
          style={{ transform: `translate3d(0, ${scrollY * -0.15}px, 0)`, opacity: Math.max(0, 1 - scrollY / 600) }}
        >
          {/* Badge contextual de bienvenida y próxima misa */}
          <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-gold/40 text-white shadow-lg transition-all mb-4 sm:mb-6">
            <Sparkles size={13} className="text-gold shrink-0 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-medium tracking-wide">{greeting}</span>
            <span className="text-white/30 hidden sm:inline">·</span>
            <span className="text-[10px] sm:text-[11px] text-gold font-semibold hidden sm:inline">{massNotice}</span>
          </div>

          {/* Título majestuoso con Shimmer dorado */}
          <h1 className="fade-up fade-up-delay-1 hero-title-glow font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium text-white leading-[1.05] tracking-tight">
            Parroquia<br />
            <span className="text-gold-shimmer italic font-normal">Santísima Trinidad</span>
          </h1>

          {/* Cita bíblica con líneas doradas */}
          <div className="fade-up fade-up-delay-2 mt-5 sm:mt-6 flex flex-col items-center justify-center gap-1.5 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="h-px w-6 sm:w-12 bg-gold/50" />
              <p className="px-1 sm:px-3 text-xs sm:text-base md:text-lg text-white/90 leading-relaxed italic font-display">
                «Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.»
              </p>
              <span className="h-px w-6 sm:w-12 bg-gold/50" />
            </div>
            <span className="text-[9px] sm:text-[11px] tracking-[0.3em] uppercase text-gold/90 font-semibold">Mateo 18, 20 · Tingo, Arequipa</span>
          </div>

          {/* Botones de acción directos y elegantes para entrar a la web */}
          <div className="fade-up fade-up-delay-3 mt-7 sm:mt-9 flex flex-wrap gap-3 justify-center items-center">
            <a
              href="#horarios"
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-gold text-primary font-bold text-xs sm:text-sm shadow-elegant hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Clock size={16} /> Ver horarios de Misa
            </a>
            <a
              href="#sobre-nosotros"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white font-medium text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              Conocer la parroquia <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Indicador sutil de scroll hacia abajo */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50 pointer-events-none">
          <span className="text-[9px] tracking-[0.3em] uppercase">Desliza</span>
          <span className="block h-7 w-px bg-gradient-to-b from-gold/80 to-transparent animate-pulse" />
        </div>
      </section>
      <Suspense fallback={<SectionSkeleton height="h-[1800px]" />}>
        <AboutSection ministries={ministries} loadingMinistries={loadingMinistries} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
        <HorariosSection groupedSchedules={groupedSchedules} loadingSchedules={loadingSchedules} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
        <GaleriaSection gallery={gallery} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <VideoSemanalSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
        <SacramentosSection />
        </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DonacionesSection items={donations} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[1400px]" />}>
        <EventosSection events={events} loadingEvents={loadingEvents} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[1200px]" />}>
        <ContactoSection />
      </Suspense>
      <WhatsAppFab />
      <ParishAIBotFab />
    </div>
  );
}
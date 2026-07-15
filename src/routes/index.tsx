import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { DonationRow } from "@/components/site/DonacionesSection";
import { Preloader } from "@/components/ui/Preloader";
import * as Sentry from "@sentry/react";

// Lazy-loaded below-the-fold sections (code-splitting)
const AboutSection = lazy(() => import("@/components/site/sections/AboutSection"));
const HorariosSection = lazy(() => import("@/components/site/sections/HorariosSection"));
const GaleriaSection = lazy(() => import("@/components/site/sections/GaleriaSection"));
const DonacionesSection = lazy(() =>
  import("@/components/site/DonacionesSection").then((m) => ({ default: m.DonacionesSection })),
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
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
  }),
  component: Home,
});

type Schedule = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
type Ministry = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url?: string | null };
type GalleryImage = { id: string; title: string | null; category: string | null; image_url: string; sort_order: number };

// Skeleton fallback with fixed approximate heights to prevent CLS
function SectionSkeleton({ height = "h-[600px]" }: { height?: string }) {
  return (
    <div className={`w-full ${height} bg-muted animate-pulse rounded-xl my-6`} aria-hidden="true" />
  );
}


function Home() {
  const [scrollY, setScrollY] = useState(0);
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

    return () => {
      window.removeEventListener("scroll", onScroll);
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

      {/* HERO SECTION (above the fold — loaded eagerly) */}
      <section id="inicio" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0 will-change-transform" style={{ transform: isMobile ? "none" : `translate3d(0, ${scrollY * 0.35}px, 0)` }}>
          <img
            src="/assets/hero-church.webp"
            alt="Fachada de la Parroquia Santísima Trinidad de Tingo al atardecer"
            className="ken-burns absolute inset-0 h-[115%] w-full object-cover"
            fetchPriority="high"
            loading="eager"
            decoding="async"
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

      {/* BELOW-THE-FOLD (code-split, lazy-loaded) */}
      <Suspense fallback={<SectionSkeleton height="h-[1800px]" />}>
        <AboutSection ministries={ministries} loadingMinistries={loadingMinistries} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[900px]" />}>
        <HorariosSection groupedSchedules={groupedSchedules} loadingSchedules={loadingSchedules} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
        <GaleriaSection gallery={gallery} />
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
    </div>
  );
}

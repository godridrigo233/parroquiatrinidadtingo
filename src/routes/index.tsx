import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Church, Clock, BookOpen, Flame, Heart, Users, Music, GraduationCap,
  Sparkles, MapPin, Phone, Facebook, Instagram, Mail, Calendar, ArrowRight, Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { FacebookFeed } from "@/components/site/FacebookFeed";
import logo from "@/assets/logo.png";
import heroImg from "@/assets/hero-church.jpg";
import interiorImg from "@/assets/church-interior.jpg";
import virgenImg from "@/assets/virgen-dolores.jpg";
import trinidadImg from "@/assets/trinidad.jpg";
import gMass from "@/assets/gallery-mass.jpg";
import gProc from "@/assets/gallery-procession.jpg";
import gComm from "@/assets/gallery-communion.jpg";
import gYouth from "@/assets/gallery-youth.jpg";
import gChoir from "@/assets/gallery-choir.jpg";
import gCandles from "@/assets/gallery-candles.jpg";

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
      { property: "og:description", content: "Comunidad católica viva en Tingo, Arequipa. Horarios, noticias, ministerios y devociones." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

type News = { id: string; title: string; excerpt: string | null; content: string; image_url: string | null; published_at: string };
type Schedule = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };
type Ministry = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null };
type Eventt = { id: string; title: string; description: string | null; event_date: string; location: string | null };

const categoryMeta: Record<string, { label: string; icon: typeof Church }> = {
  misa: { label: "Santa Misa", icon: Church },
  confesion: { label: "Confesiones", icon: Heart },
  catequesis: { label: "Catequesis", icon: BookOpen },
  adoracion: { label: "Adoración", icon: Flame },
  pastoral: { label: "Pastoral", icon: Users },
};

const ministryIcons = [Music, BookOpen, Users, Sparkles, Heart, GraduationCap];

const testimonios = [
  { text: "La parroquia es mi segundo hogar. Aquí encuentro paz y comunidad.", author: "María C." },
  { text: "Un excelente lugar para compartir experiencias de fe y crecer espiritualmente.", author: "Carlos M." },
  { text: "Lugar santo, las personas son muy amables y acogedoras.", author: "Lucía R." },
  { text: "Hermosa parroquia, muy bien ubicada. Excelente lugar para acercarse a Dios.", author: "José A." },
];

const galleryImgs = [
  { src: gMass, label: "Santa Misa" },
  { src: gProc, label: "Procesión" },
  { src: gComm, label: "Primera Comunión" },
  { src: gYouth, label: "Pastoral Juvenil" },
  { src: gChoir, label: "Coro Parroquial" },
  { src: gCandles, label: "Oración" },
];

function Home() {
  const [, setNews] = useState<News[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<Eventt[]>([]);

  useEffect(() => {
    (async () => {
      const [n, s, m, e] = await Promise.all([
        supabase.from("news").select("*").order("published_at", { ascending: false }).limit(6),
        supabase.from("schedules").select("*").order("sort_order"),
        supabase.from("ministries").select("*").order("created_at"),
        supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date").limit(3),
      ]);
      if (n.data) setNews(n.data as News[]);
      if (s.data) setSchedules(s.data as Schedule[]);
      if (m.data) setMinistries(m.data as Ministry[]);
      if (e.data) setEvents(e.data as Eventt[]);
    })();
  }, []);

  const groupedSchedules = schedules.reduce<Record<string, Schedule[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section id="inicio" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img src={heroImg} alt="Parroquia Santísima Trinidad" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
          <span className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white/90 text-xs uppercase tracking-[0.2em]">
            <Sparkles size={14} className="text-gold" /> Arequipa · Perú
          </span>
          <h1 className="fade-up fade-up-delay-1 mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.05]">
            Parroquia<br />
            <span className="text-gold italic">Santísima Trinidad</span>
          </h1>
          <p className="fade-up fade-up-delay-2 mt-6 text-sm sm:text-base md:text-lg text-white/85 leading-relaxed italic md:whitespace-nowrap">
            «Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.»
          </p>
          <div className="fade-up fade-up-delay-3 mt-10 flex flex-wrap gap-3 justify-center">
            <a href="#horarios" className="px-7 py-3.5 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-elegant hover:scale-105 transition-transform flex items-center gap-2">
              <Clock size={18} /> Ver horarios
            </a>
            <a href="#noticias" className="px-7 py-3.5 rounded-full bg-white/10 border border-white/30 backdrop-blur text-white font-semibold hover:bg-white/20 transition-colors">
              Noticias
            </a>
            <a href="#contacto" className="px-7 py-3.5 rounded-full bg-white text-foreground font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
              Contacto <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest uppercase animate-pulse">
          Desliza para descubrir
        </div>
      </section>

      {/* SOBRE LA PARROQUIA */}
      <section id="parroquia" className="py-24 md:py-32 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <img src={interiorImg} alt="Interior de la parroquia" loading="lazy" className="rounded-2xl shadow-elegant w-full aspect-[4/5] object-cover" />
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

      {/* HORARIOS */}
      <section id="horarios" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Vida sacramental</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Horarios parroquiales</h2>
            <p className="mt-4 text-muted-foreground">Te esperamos para celebrar juntos la fe.</p>
          </Reveal>

          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {Object.entries(groupedSchedules)
              .filter(([cat]) => cat !== "catequesis")
              .map(([cat, items], i) => {
              const meta = categoryMeta[cat] ?? { label: cat, icon: Church };
              const Icon = meta.icon;
              return (
                <Reveal key={cat} delay={i * 80} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                  <div className="h-full bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-elegant transition-shadow group">
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
            })}
          </div>
        </div>
      </section>

      {/* NOTICIAS */}
      <section id="noticias" className="py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Vida parroquial</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Noticias y avisos</h2>
            </div>
            <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold inline-flex items-center gap-2 hover:text-gold transition-colors">
              <Facebook size={18} /> Síguenos en Facebook
            </a>
          </Reveal>

          {events.length > 0 && (
            <Reveal className="mt-10">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 shadow-elegant">
                <p className="uppercase tracking-[0.2em] text-xs text-gold font-semibold">Próximos eventos</p>
                <div className="mt-5 grid md:grid-cols-3 gap-6">
                  {events.map((e) => (
                    <div key={e.id} className="border-l-2 border-gold pl-4">
                      <p className="font-display text-xl">{e.title}</p>
                      <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1.5">
                        <Calendar size={14} /> {new Date(e.event_date).toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
                      </p>
                      {e.description && <p className="text-sm text-primary-foreground/70 mt-2 line-clamp-2">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal className="mt-12">
            <FacebookFeed />
          </Reveal>
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
            {ministries.map((m, i) => {
              const Icon = ministryIcons[i % ministryIcons.length];
              return (
                <Reveal key={m.id} delay={i * 80}>
                  <div className="h-full bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all">
                    <Icon size={32} className="text-gold" />
                    <h3 className="mt-4 font-display text-2xl text-primary">{m.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                    <div className="mt-5 pt-5 border-t border-border space-y-1.5 text-sm">
                      {m.leader && <p className="text-foreground"><span className="text-muted-foreground">Encargado:</span> {m.leader}</p>}
                      {m.schedule && <p className="text-foreground flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {m.schedule}</p>}
                    </div>
                  </div>
                </Reveal>
              );
            })}
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
              { img: virgenImg, title: "Nuestra Señora de los Dolores", text: "Madre fiel que acompaña al pie de la cruz. La parroquia mantiene viva esta devoción mariana con el rezo del rosario y celebraciones especiales." },
              { img: trinidadImg, title: "Santísima Trinidad", text: "Misterio central de nuestra fe: Padre, Hijo y Espíritu Santo. Bajo su nombre celebramos cada eucaristía y vivimos como comunidad." },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden shadow-elegant aspect-[4/5]">
                  <img src={d.img} alt={d.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
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

      {/* GALERÍA */}
      <section id="galeria" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Comunidad en imágenes</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Galería</h2>
          </Reveal>

          <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {galleryImgs.map((g, i) => (
              <Reveal key={i} delay={i * 50}>
                <figure className="relative break-inside-avoid rounded-2xl overflow-hidden shadow-card group">
                  <img src={g.src} alt={g.label} loading="lazy" className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 2 ? "aspect-[4/5]" : "aspect-square"}`} />
                  <figcaption className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-white font-display text-xl">{g.label}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
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
                  <p className="text-white/75 text-sm">+51 932 269 859</p>
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
                  <p className="text-white/75 text-sm">parroquiatrinidadtingo@gmail.com</p>
                </div>
              </li>
            </ul>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Americas+1820+Arequipa+Tingo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-primary font-semibold shadow-card hover:shadow-elegant transition-shadow"
            >
              <MapPin size={18} /> Cómo llegar
            </a>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-2xl overflow-hidden shadow-elegant border border-white/10 aspect-[4/3] bg-white/5">
              <iframe
                title="Mapa parroquia"
                src="https://www.google.com/maps?q=Americas+1820,+Arequipa+04011,+Peru&output=embed"
                className="w-full h-full"
                loading="lazy"
              />
            </div>

            <form
              className="mt-8 bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const msg = `Hola, soy ${fd.get("nombre")}. ${fd.get("mensaje")}`;
                window.open(`https://wa.me/51932269859?text=${encodeURIComponent(msg)}`, "_blank");
              }}
            >
              <p className="font-display text-2xl text-white">Escríbenos</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input required name="nombre" placeholder="Tu nombre" className="bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-gold" />
                <input required type="email" name="email" placeholder="Correo" className="bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-gold" />
              </div>
              <textarea required name="mensaje" rows={4} placeholder="¿Cómo podemos ayudarte?" className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-gold resize-none" />
              <button type="submit" className="w-full py-3 rounded-lg bg-gradient-gold text-primary font-semibold hover:shadow-elegant transition-shadow">
                Enviar mensaje
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-foreground border-t border-white/10 py-12 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-12 w-12" />
              <div>
                <p className="font-display text-lg text-white">Santísima Trinidad</p>
                <p className="text-xs text-white/60 uppercase tracking-widest">Tingo · Arequipa</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/70 italic font-display">
              «Gloria al Padre, al Hijo y al Espíritu Santo.»
            </p>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Horarios rápidos</p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>Domingos · 8:00 AM, 10:00 AM y 7:00 PM</li>
              <li>Lun – Vie · 7:00 PM</li>
              <li>Sábado · 6:00 PM (vigilia)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Síguenos</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm">
                <Facebook size={16} /> Facebook
              </a>
              <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm">
                <Instagram size={16} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Parroquia Santísima Trinidad de Tingo · Carmelitas de María Inmaculada. Todos los derechos reservados.
        </div>
      </footer>

      <WhatsAppFab />
    </div>
  );
}

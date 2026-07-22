import { Church, Clock, BookOpen, Heart, Users, Music, Sparkles, GraduationCap, MapPin, User  } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import React, { useState, useEffect } from "react";
type Ministry = { id: string; name: string; description: string | null; leader: string | null; schedule: string | null; image_url: string | null; location: string };

const ministryIcons = [Music, BookOpen, Users, Sparkles, Heart, GraduationCap];

const ministryPhotos = [
  "/assets/ministries/alas-de-fe.png",
  "/assets/ministries/siervos-de-luz.png",
  "/assets/ministries/acolitos.png",
  "/assets/ministries/senor-de-los-milagros.png",
  "/assets/ministries/legion-de-maria.png",
  null,
];

// Datos fijos de cada capilla filial (ubicación/horario no vienen de la base de datos)
const chapels: { key: string; icon: string; ubicacion: string; horario: string; encargado?: string; photos: string[] }[] = [
  {
    key: "Capilla María de la Merced", icon: "🛐", ubicacion: "Amp. Pampa del Cusco", horario: "Domingos 6:00 p.m.",
    photos: [
        "/assets/capillas/maria-de-la-merced-1.jpg",
        "/assets/capillas/maria-de-la-merced-2.jpg",
        "/assets/capillas/maria-de-la-merced-3.jpg",
        "/assets/capillas/maria-de-la-merced-4.jpg",
    ],
  },
  {
    key: "Capilla Virgen de Fátima", icon: "🕊️", ubicacion: "Pampa del Cusco", horario: "Domingos 10:00 a.m.", encargado: "Hno. Gilvert",
    photos: [
      "/assets/capillas/virgen-de-fatima-1.jpg",
      "/assets/capillas/virgen-de-fatima-2.jpg",
      "/assets/capillas/virgen-de-fatima-3.jpg",
      "/assets/capillas/virgen-de-fatima-4.jpg",
    ],
  },
  {
    key: "Capilla Virgen del Carmen", icon: "⛪", ubicacion: "Plaza de Tingo Grande", horario: "Domingos 12:00 p.m.",
    photos: [
      "/assets/capillas/virgen-del-carmen-1.jpg",
      "/assets/capillas/virgen-del-carmen-2.jpg",
      "/assets/capillas/virgen-del-carmen-3.jpg",
      "/assets/capillas/virgen-del-carmen-4.jpg",
    ],
  },
];

const sacerdotes = [
  {
    img: "/assets/padre-tommy.jpg",
    name: "Rvdo. P. Tomy Thengumparambil, CMI ",
    role: "Párroco",
    desc: "Pastor de la comunidad, dedicado a la celebración de los sacramentos, la formación de los fieles y el acompañamiento espiritual de la familia parroquial.",
  },
  {
    img: "/assets/padre-manesh.jpg",
    name: "Rvdo. P. Manesh Kunnakkattu, CMI",
    role: "Vicario parroquial",
    desc: "Colabora en la vida pastoral de la parroquia, animando los ministerios, la catequesis y la cercanía con los jóvenes y las familias.",
  },
];

export default function AboutSection({
  ministries,
  loadingMinistries,
}: {
  ministries: Ministry[];
  loadingMinistries: boolean;
}) {
  const [activeTab, setActiveTab] = useState<string>("Sede Central");
  const [slideIndex, setSlideIndex] = useState(0);

  const activeChapelData = chapels.find((c) => c.key === activeTab);

  // Reset slide and auto-advance when tab or photos change
  useEffect(() => {
    setSlideIndex(0);
    const photos = activeChapelData?.photos ?? [];
    if (photos.length <= 1) return;
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(id);
  }, [activeTab]);

  return (
    <>
      {/* SOBRE LA PARROQUIA */}
      <section id="parroquia" className="py-24 md:py-32 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <OptimizedImage src="/assets/church-interior.webp" alt="Interior de la parroquia" className="rounded-2xl shadow-elegant w-full aspect-[4/5] object-cover" />
              <div className="absolute -bottom-8 -right-8 hidden md:block bg-card rounded-2xl shadow-card p-6 max-w-[220px] border border-border">
                <p className="font-display text-3xl text-gold">+50</p>
                <p className="text-sm text-muted-foreground mt-1">Años de permanencia en el Perú </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Nuestra parroquia</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-tight">
              Una casa de oración<br />en el corazón de <span className="italic text-gold">Tingo</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg text-justify">
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
      {/* MINISTERIOS Y CAPILLAS CON PESTAÑAS */}
      <section id="ministerios" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">

          {/* ── ENCABEZADO ── */}
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Servir y caminar juntos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Comunidad y Ministerios</h2>
            {/* Ornamento dorado */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="text-gold text-base leading-none">✦</span>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <p className="mt-3 text-muted-foreground text-sm">Carismas al servicio de nuestra parroquia y su jurisdicción.</p>
          </Reveal>

          {/* ── TABS ── */}
          <Reveal delay={100} className="mt-10 flex justify-center">
            <div className="inline-flex p-1.5 bg-card/80 backdrop-blur border border-border/80 rounded-full shadow-sm max-w-full overflow-x-auto">

              {/* Sede Central */}
              <button
                onClick={() => setActiveTab("Sede Central")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === "Sede Central"
                    ? "bg-gradient-gold text-primary-foreground shadow-md scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span>⛪</span>
                <span>Sede Parroquial Central</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "Sede Central" ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {ministries.filter(m => !m.location || m.location === "Sede Central").length}
                </span>
              </button>

              {/* Capillas filiales */}
              {chapels.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveTab(c.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === c.key
                      ? "bg-primary text-white shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{c.icon}</span>
                  {/* Móvil: solo icono. sm+: nombre sin "Capilla " */}
                  <span className="hidden sm:inline">{c.key.replace("Capilla ", "")}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === c.key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {ministries.filter(m => m.location === c.key).length}
                  </span>
                </button>
              ))}

            </div>
          </Reveal>

          {/* ── CONTENIDO ── */}
          <div className="mt-12 min-h-[400px]">
            {loadingMinistries ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Reveal key={`skel-min-${i}`} delay={i * 80}><SkeletonCard /></Reveal>
                ))}
              </div>
            ) : (
              (() => {
                const filtered = ministries.filter(m => {
                  if (activeTab === "Sede Central") return !m.location || m.location === "Sede Central";
                  return m.location === activeTab;
                });
                const activeChapel = chapels.find((c) => c.key === activeTab);

                return (
                  <>
                    {/* Tarjeta informativa de capilla con carousel */}
                    {activeChapel && (
                      <Reveal>
                        <div className="bg-card rounded-2xl mb-8 overflow-hidden border border-border shadow-card max-w-2xl mx-auto">
                          {activeChapel.photos.length > 0 ? (
                            <div className="relative aspect-[16/7] overflow-hidden">
                              {activeChapel.photos.map((src, idx) => (
                                <img
                                  key={src}
                                  src={src}
                                  alt={`${activeChapel.key} ${idx + 1}`}
                                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                                  style={{ opacity: idx === slideIndex ? 1 : 0 }}
                                />
                              ))}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <h3 className="absolute bottom-8 left-6 text-white font-display text-2xl md:text-3xl font-semibold drop-shadow">
                                {activeChapel.key}
                              </h3>
                              {/* Dots */}
                              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                {activeChapel.photos.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSlideIndex(idx)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === slideIndex ? "bg-white w-4" : "bg-white/50"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="h-1 bg-gradient-gold" />
                              <div className="p-6 md:p-8 flex items-center gap-4">
                                <span className="text-4xl leading-none flex-shrink-0">{activeChapel.icon}</span>
                                <h3 className="font-display text-2xl text-primary">{activeChapel.key}</h3>
                              </div>
                            </>
                          )}
                          <div className="p-5 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-xl text-xs font-medium">
                              <MapPin size={11} /> {activeChapel.ubicacion}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-xl text-xs font-medium">
                              <Clock size={11} /> Misa: {activeChapel.horario}
                            </span>
                            {activeChapel.encargado && (
                              <span className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-xl text-xs font-medium">
                                <User size={11} /> {activeChapel.encargado}
                              </span>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {/* Estado vacío */}
                    {filtered.length === 0 && (
                      <div className="text-center py-16">
                        <Church size={40} className="mx-auto mb-4 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          Aún no hay grupos registrados en esta {activeChapel ? "capilla" : "sede"}.
                        </p>
                      </div>
                    )}

                    {/* Grid de tarjetas */}
                    {filtered.length > 0 && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
                        {filtered.map((m, i) => {
                          const Icon = ministryIcons[i % ministryIcons.length];
                          const ministryImage = m.image_url || ministryPhotos[i];
                          return (
                            <Reveal key={m.id} delay={i * 80}>
                              <article className="group h-full flex flex-col bg-card rounded-2xl border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all overflow-hidden will-change-transform">

                                {/* Imagen desde Supabase / placeholder si no hay */}
                                <div className="relative aspect-[16/10] overflow-hidden">
                                  {ministryImage ? (
                                    <OptimizedImage
                                      src={`${ministryImage}?v=1`}
                                      alt={m.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-primary/5 flex items-center justify-center relative overflow-hidden">
                                      {/* Círculos decorativos sutiles */}
                                      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-gold/15" />
                                      <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full border border-gold/10" />
                                      <div className="absolute top-3 left-4 w-10 h-10 rounded-full border border-gold/10" />
                                      {/* Cruz de fondo muy sutil */}
                                      <span className="absolute text-7xl text-primary/5 font-bold select-none pointer-events-none">✝</span>
                                      {/* Ícono del ministerio en círculo dorado */}
                                      <div className="relative z-10 flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
                                          <Icon size={24} className="text-gold" />
                                        </div>
                                        <p className="font-display text-primary/60 text-xs font-medium px-4 text-center">{m.name}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Cuerpo de la tarjeta */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className="font-display text-2xl text-primary">{m.name}</h4>
                                    {m.description && (
                                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-justify line-clamp-3">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Encargado con avatar */}
                                  {m.leader && (
                                    <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                        <User size={13} className="text-gold" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-gold uppercase tracking-wider font-semibold leading-none mb-0.5">
                                          Encargado
                                        </p>
                                        <p className="text-sm text-foreground font-medium">{m.leader}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </article>
                            </Reveal>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>

        </div>
      </section>
    </>
  );
}

import { Church, Clock, BookOpen, Heart, Users, Music, Sparkles, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import React, { useState } from "react";
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
const chapels: { key: string; icon: string; ubicacion: string; horario: string; encargado?: string }[] = [
  { key: "Capilla María de la Merced", icon: "🛐", ubicacion: "Amp. Pampa del Cusco", horario: "Domingos 6:00 p.m." },
  { key: "Capilla Virgen de Fátima", icon: "🕊️", ubicacion: "Pampa del Cusco", horario: "Domingos 10:00 a.m.", encargado: "Hno. Gilvert" },
  { key: "Capilla Virgen del Carmen", icon: "⛪", ubicacion: "Plaza de Tingo Grande", horario: "Domingos 12:00 p.m." },
];

const sacerdotes = [
  {
    img: "/assets/padre-tommy.jpg",
    name: "Rvdo.P. Tomy Thengumparambil, CMI ",
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
          
          {/* ── ENCABEZADO PRINCIPAL ── */}
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Servir y caminar juntos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Comunidad y Ministerios</h2>
            <p className="mt-4 text-muted-foreground">Carismas al servicio de nuestra parroquia y su jurisdicción.</p>
          </Reveal>

          {/* ── BARRA DE PESTAÑAS (TABS) ── */}
          <Reveal delay={100} className="mt-10 flex justify-center">
            <div className="inline-flex p-1.5 bg-card/80 backdrop-blur border border-border/80 rounded-full shadow-sm max-w-full overflow-x-auto">

              {/* Botón Sede Central */}
              <button
                onClick={() => setActiveTab("Sede Central")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === "Sede Central"
                    ? "bg-gradient-gold text-primary-foreground shadow-md scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span>⛪ Sede Parroquial Central</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px]`}>
                  {ministries.filter(m => !m.location || m.location === "Sede Central").length}
                </span>
              </button>

              {/* Botones de capillas filiales */}
              {chapels.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveTab(c.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === c.key
                      ? "bg-primary text-white shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{c.icon} {c.key}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === c.key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {ministries.filter(m => m.location === c.key).length}
                  </span>
                </button>
              ))}

            </div>
          </Reveal>

          {/* ── CONTENIDO DE LA PESTAÑA SELECCIONADA ── */}
          <div className="mt-12 min-h-[400px]">
            {loadingMinistries ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Reveal key={`skel-min-${i}`} delay={i * 80}><SkeletonCard /></Reveal>
                ))}
              </div>
            ) : (
              (() => {
                // Filtramos los ministerios según la pestaña seleccionada
                const filtered = ministries.filter(m => {
                  if (activeTab === "Sede Central") {
                    return !m.location || m.location === "Sede Central";
                  }
                  return m.location === activeTab;
                });

                const activeChapel = chapels.find((c) => c.key === activeTab);

                return (
                  <>
                    {/* Tarjeta de información de la capilla (siempre visible mientras esté seleccionada) */}
                    {activeChapel && (
                      <Reveal>
                        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 text-center border border-primary/15 shadow-sm max-w-3xl mx-auto">
                          <span className="text-4xl block mb-3">{activeChapel.icon}</span>
                          <h3 className="text-primary font-display text-2xl md:text-3xl font-semibold">
                            {activeChapel.key}
                          </h3>
                          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-medium text-primary/80">
                            <span className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-1.5">
                              📍 {activeChapel.ubicacion}
                            </span>
                            <span className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-1.5">
                              🕒 Misa: {activeChapel.horario}
                            </span>
                            {activeChapel.encargado && (
                              <span className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-1.5">
                                👤 Encargado: {activeChapel.encargado}
                              </span>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )}

                    {filtered.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Aún no hay grupos registrados en esta {activeChapel ? "capilla" : "sede"}.
                      </p>
                    ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
                    {filtered.map((m, i) => {
                      const ministryImage = m.image_url || ministryPhotos[i];
                      return (
                        <Reveal key={m.id} delay={i * 80}>
                          <article className="group h-full flex flex-col bg-card rounded-2xl border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all overflow-hidden will-change-transform">
                            <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                              {ministryImage ? (
                                <OptimizedImage src={`${ministryImage}?v=1`} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-display font-medium text-sm">
                                  {m.name}
                                </div>
                              )}
                              
                              {/* Etiqueta flotante en la esquina de la foto */}
                              <div className="absolute top-3 left-3">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wider shadow-sm ${
                                  activeTab === "Sede Central"
                                    ? "bg-black/40 text-white border border-white/20"
                                    : "bg-primary text-white"
                                }`}>
                                
                                </span>
                              </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-display text-2xl text-primary">{m.name}</h4>
                                {m.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-justify line-clamp-3">{m.description}</p>}
                              </div>
                                <div className="mt-5 pt-5 border-t border-border space-y-1.5 text-sm">
                                  {m.leader && <p className="text-foreground truncate"><span className="text-muted-foreground">Encargado:</span> {m.leader}</p>}
                      
                                </div>
                            
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

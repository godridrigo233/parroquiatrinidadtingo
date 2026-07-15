import { Church, Clock, BookOpen, Heart, Users, Music, Sparkles, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { OptimizedImage } from "@/components/site/OptimizedImage";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

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

      {/* MINISTERIOS Y CAPILLAS */}
      <section id="ministerios" className="py-24 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          
          {/* ── ENCABEZADO PRINCIPAL ── */}
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Servir y caminar juntos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Comunidad y Ministerios</h2>
            <p className="mt-4 text-muted-foreground">Carismas al servicio de nuestra parroquia y su jurisdicción.</p>
          </Reveal>

          {/* ── 1. BLOQUE DE CAPILLA MARÍA DE LA MERCED (PERIFÉRICA) ── */}
          <div className="mt-16 mb-20">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold tracking-[0.2em] bg-primary/10 text-primary uppercase px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  🛐 Capilla de la Jurisdicción
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-primary font-semibold">
                  Capilla María de la Merced
                </h3>
              </div>
            </Reveal>
            <div className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/15 shadow-sm">
              {loadingMinistries ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonCard />
                </div>
              ) : (
                (() => {
                  const capillaMinistries = ministries.filter(m => m.location === "Capilla María de la Merced");
                  
                  if (capillaMinistries.length === 0) {
                    return (
                      <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-primary/20">
                        <p className="text-primary font-display text-xl font-medium">Hermandad</p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto text-justify sm:text-center">
                          Templo de oración y sede en nuestra comunidad de Hunter. Atendida pastoralmente por los Padres Carmelitas de la Sede Central de Santísima Trinidad.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary/80 bg-primary/5 px-4 py-2 rounded-xl">
                          ℹ️ Trámites de secretaría e intenciones se centralizan en la Sede Parroquial.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {capillaMinistries.map((m, i) => (
                        <article key={m.id} className="group h-full flex flex-col bg-white rounded-2xl border border-primary/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                            {m.image_url ? (
                              <OptimizedImage src={`${m.image_url}?v=1`} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-display font-medium">Capilla La Merced</div>
                            )}
                            <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              La Merced
                            </div>
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h4 className="font-display text-2xl text-primary">{m.name}</h4>
                            {m.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-justify">{m.description}</p>}
                            {(m.leader || m.schedule) && (
                              <div className="mt-5 pt-5 border-t border-border space-y-1.5 text-sm">
                                {m.leader && <p className="text-foreground"><span className="text-muted-foreground">Encargado:</span> {m.leader}</p>}
                                {m.schedule && <p className="text-foreground flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {m.schedule}</p>}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* ── 2. BLOQUE DE MINISTERIOS DE LA SEDE CENTRAL ── */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-8 border-t border-border/80 pt-12">
                <span className="text-xs font-bold tracking-[0.2em] bg-gold/20 text-amber-800 uppercase px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  ⛪ Sede Central
                </span>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl text-primary font-semibold">
                    Ministerios y Grupos del Templo Principal
                  </h3>
                  <p className="text-sm text-muted-foreground">Grupos comunitarios que sirven en Tingo.</p>
                </div>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingMinistries ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Reveal key={`skel-min-${i}`} delay={i * 80}><SkeletonCard /></Reveal>
                ))
              ) : (
                ministries
                  .filter(m => !m.location || m.location === "Sede Central")
                  .map((m, i) => {
                    const ministryImage = m.image_url || ministryPhotos[i];
                    return (
                      <Reveal key={m.id} delay={i * 80}>
                        <article className="group h-full flex flex-col bg-card rounded-2xl border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all overflow-hidden will-change-transform">
                          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                            {ministryImage && (
                              <OptimizedImage src={`${ministryImage}?v=1`} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform" />
                            )}
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h4 className="font-display text-2xl text-primary">{m.name}</h4>
                            {m.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-justify">{m.description}</p>}
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

        </div>
      </section>
    </>
  );
}

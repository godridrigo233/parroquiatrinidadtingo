import { Link } from "@tanstack/react-router";
import { Droplets, Cookie, HeartHandshake, Heart, HandHeart, Cross, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const sacramentos = [
  { icon: Droplets, title: "Bautismo", color: "#3B7A8C", intro: "Puerta de entrada a la vida cristiana. Por el agua y el Espíritu nacemos a la fe.", hash: "bautismo" },
  { icon: Cookie, title: "Primera Comunión", color: "#C8A030", intro: "Encuentro con el Señor presente en la Eucaristía. Pan de vida para el camino.", hash: "primera-comunion" },
  { icon: HeartHandshake, title: "Matrimonio", color: "#7A3B3B", intro: "Alianza de amor entre un varón y una mujer, signo del amor de Cristo por su Iglesia.", hash: "matrimonio" },
  { icon: Heart, title: "Reconciliación", color: "#4A7C59", intro: "El abrazo misericordioso del Padre que perdona y restaura.", hash: "reconciliacion" },
  { icon: HandHeart, title: "Unción de los Enfermos", color: "#6B6B3D", intro: "Consuelo y fortaleza para quienes atraviesan enfermedad grave o edad avanzada.", hash: "uncion" },
  { icon: Cross, title: "Orden Sacerdotal", color: "#5C3D6E", intro: "Vocación al servicio del Pueblo de Dios como diácono, presbítero u obispo.", hash: "orden" },
];

export default function SacramentosSection() {
  return (
    <section id="sacramentos" className="py-24 px-5 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Signos de la gracia</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Sacramentos</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Celebra tu fe con nosotros. Conoce los requisitos y prepara cada sacramento paso a paso.
          </p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {sacramentos.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 80}>
                <Link
                  to="/sacramentos"
                  hash={s.hash}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant active:scale-[0.99]"
                >
                  {/* Halo de color al hover */}
                  <span
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="relative flex items-start gap-4">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: s.color }}
                    >
                      <Icon size={26} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl text-primary leading-tight">{s.title}</h3>
                    </div>
                  </div>
                  <p className="relative mt-4 text-sm text-muted-foreground leading-relaxed">{s.intro}</p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
                    Ver requisitos
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

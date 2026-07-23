import { Link } from "@tanstack/react-router";
import { Droplets, Cookie, HeartHandshake, Heart, HandHeart, Cross, Flame, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const sacramentos = [
  { icon: Droplets, title: "Bautismo", color: "#3B7A8C", intro: "Puerta de entrada a la vida cristiana.", hash: "bautismo" },
  { icon: Cookie, title: "Eucaristía", color: "#C8A030", intro: "Encuentro con Jesús en la Eucaristía.", hash: "primera-comunion" },
  { icon: Flame, title: "Confirmación", color: "#D4652A", intro: "El Espíritu Santo fortalece la fe.", hash: "confirmacion" },
  { icon: HeartHandshake, title: "Matrimonio", color: "#7A3B3B", intro: "Alianza de amor bendecida por Dios.", hash: "matrimonio" },
  { icon: Heart, title: "Penitencia (Confesión)", color: "#4A7C59", intro: "El abrazo misericordioso del Padre.", hash: "reconciliacion" },
  { icon: HandHeart, title: "Unción de los Enfermos", color: "#6B6B3D", intro: "Consuelo y fortaleza en la enfermedad.", hash: "uncion" },
  { icon: Cross, title: "Orden Sacerdotal", color: "#5C3D6E", intro: "Vocación al servicio de Dios.", hash: "orden" },
];

export default function SacramentosSection() {
  return (
    <section id="sacramentos" className="py-16 px-5 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Signos de la gracia</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Sacramentos</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Celebra tu fe con nosotros. Conoce los requisitos y prepara cada sacramento paso a paso.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
          {sacramentos.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 80}>
                <Link
                  to="/sacramentos"
                  hash={s.hash}
                  className="group relative block h-full w-full max-w-[260px] overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant active:scale-[0.99]"
                >
                  <span
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="relative flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: s.color }}
                    >
                      <Icon size={22} />
                    </span>
                    <h3 className="font-display text-base font-semibold text-primary leading-tight">{s.title}</h3>
                  </div>
                  <p className="relative mt-3 text-xs text-muted-foreground leading-relaxed">{s.intro}</p>
                  <span className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gold">
                    Ver requisitos
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/sacramentos" className="inline-flex items-center gap-2 px-7 py-3 text-sm rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-card hover:shadow-elegant transition-shadow">
            Ver todos los sacramentos <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

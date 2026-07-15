import { Link } from "@tanstack/react-router";
import { Church, Heart, BookOpen, Flame, Users, Briefcase, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

type Schedule = { id: string; category: string; day_label: string; time_label: string; notes: string | null; sort_order: number };

const categoryMeta: Record<string, { label: string; icon: typeof Church }> = {
  misa: { label: "Santa Misa", icon: Church },
  confesion: { label: "Confesiones", icon: Heart },
  catequesis: { label: "Catequesis", icon: BookOpen },
  adoracion: { label: "Adoración", icon: Flame },
  secretaria: { label: "Secretaría", icon: Briefcase },
};

export default function HorariosSection({
  groupedSchedules,
  loadingSchedules,
}: {
  groupedSchedules: Record<string, Schedule[]>;
  loadingSchedules: boolean;
}) {
  return (
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
  );
}

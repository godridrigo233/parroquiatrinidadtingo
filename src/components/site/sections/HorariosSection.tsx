import { Link } from "@tanstack/react-router";
import { Church, Heart, BookOpen, Flame, Users, Briefcase, ArrowRight, BellRing } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PushNotificationToggle } from "@/components/site/PushNotificationToggle";

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

        {/* 🔔 Banner de Recordatorio de Misa Dominical */}
        <Reveal delay={200} className="mt-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#1e2a5e] via-[#162048] to-[#0f1736] text-white p-6 sm:p-7 rounded-3xl shadow-elegant border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <BellRing size={24} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-lg text-white">Recordatorio de Misa Dominical</h4>
                <p className="text-xs text-white/80 mt-0.5">
                  Recibe un aviso automático en tu celular 30 minutos antes (Domingos 7:30 AM y 5:30 PM).
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0 min-w-[210px]">
              <PushNotificationToggle />
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

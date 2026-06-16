import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Cookie, HeartHandshake, Heart, HandHeart, Cross, Phone, Clock, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// NOTA: Se eliminó la importación de ogSacramentos aquí

const SITE_URL = "https://parroquiatrinidadtingo.lovable.app";

const sacramentos = [
  {
    id: "bautismo",
    icon: Droplets,
    title: "Bautismo",
    intro: "Puerta de entrada a la vida cristiana. Por el agua y el Espíritu nacemos a la fe.",
    requisitos: [
      "Copia de DNI.",
      "Recibo de agua y recibo de luz (ambos obligatorios).",
      "Padrinos casados por la Iglesia, o padrinos solteros confirmados.",
      "Si son padrinos solteros, presentar constancia de confirmación.",
      "Asistir a la charla pre-bautismal (padres y padrinos).",
    ],
    horario: "Solicitar con un mínimo de 1 mes de anticipación.",
    nota: "Para bautismos de mayores de 8 años se requiere asistir a catequesis.",
  },
  {
    id: "primera-comunion",
    icon: Cookie,
    title: "Primera Comunión",
    intro: "Encuentro con el Señor presente en la Eucaristía. Pan de vida para el camino.",
    requisitos: [
      "Edad mínima: 9 años.",
      "Catequesis de 1 año.",
      "Pago de inscripción.",
      "Presentar la documentación requerida por secretaría.",
    ],
    horario: "Inscripciones en secretaría parroquial.",
  },
  {
    id: "matrimonio",
    icon: HeartHandshake,
    title: "Matrimonio",
    intro: "Alianza de amor entre un varón y una mujer, signo del amor de Cristo por su Iglesia.",
    requisitos: [
      "Partida de Bautismo de los novios (original y actualizada).",
      "Constancia de Confirmación.",
      "Partida de Nacimiento de los contrayentes.",
      "Partida de Matrimonio Civil o edicto.",
      "Charla de Matrimonio para los novios o certificado de charlas, firmado por el párroco y con sello de la parroquia.",
      "Dos testigos que no sean sus parientes (uno para cada cónyuge) y entrevista de los testigos con el sacerdote.",
      "Copia nítida de DNI de los novios y de los testigos.",
      "Fotos de novios: una de cada uno, tamaño carné.",
      "Padrinos casados por la Iglesia y partida de matrimonio religioso de los padrinos.",
      "Dos entrevistas de novios con el sacerdote.",
      "Inscripción con anticipación de 90 días (3 meses).",
      "Abonar el derecho parroquial.",
    ],
    horario: "Atención para preparación: lunes a sábado de 3:00 a 6:00 PM.",
  },
  {
    id: "reconciliacion",
    icon: Heart,
    title: "Reconciliación (Confesión)",
    intro: "El abrazo misericordioso del Padre que perdona y restaura.",
    requisitos: [
      "No requiere inscripción previa.",
      "Examen de conciencia, arrepentimiento y propósito de enmienda.",
    ],
    horario: "Antes o después de misa.",
  },
  {
    id: "uncion",
    icon: HandHeart,
    title: "Unción de los enfermos",
    intro: "Consuelo y fortaleza para quienes atraviesan enfermedad grave o edad avanzada.",
    requisitos: [
      "Solicitar al sacerdote en cualquier momento.",
      "Indicar dirección y estado del enfermo.",
    ],
    horario: "Atención a domicilio coordinando por teléfono o en secretaría.",
  },
  {
    id: "orden",
    icon: Cross,
    title: "Orden sacerdotal",
    intro: "Vocación al servicio del Pueblo de Dios como diácono, presbítero u obispo.",
    requisitos: [
      "Discernimiento vocacional con un sacerdote acompañante.",
      "Formación en el seminario diocesano.",
    ],
    horario: "Conversa con el párroco para acompañamiento vocacional.",
  },
];

export const Route = createFileRoute("/sacramentos")({
  head: () => ({
    meta: [
      { title: "Sacramentos · Parroquia Santísima Trinidad de Tingo" },
      {
        name: "description",
        content:
          "Requisitos para Bautismo, Primera Comunión, Matrimonio, Confesión, Unción y Orden en la Parroquia Santísima Trinidad de Tingo, Arequipa.",
      },
      { property: "og:title", content: "Sacramentos · Parroquia Santísima Trinidad" },
      {
        property: "og:description",
        content:
          "Conoce los requisitos y horarios para recibir los sacramentos en nuestra parroquia.",
      },
      { property: "og:url", content: `${SITE_URL}/sacramentos` },
      { property: "og:type", content: "article" },
      // NOTA: Se actualizó la variable a la ruta de texto directo en las dos líneas siguientes:
      { property: "og:image", content: `${SITE_URL}/assets/og-sacramentos.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/assets/og-sacramentos.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/sacramentos` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: sacramentos.map((s) => ({
            "@type": "Question",
            name: `¿Cuáles son los requisitos para ${s.title}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: s.requisitos.join(" "),
            },
          })),
        }),
      },
    ],
  }),
  component: SacramentosPage,
});

function SacramentosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-5 lg:px-8 bg-gradient-to-b from-primary to-primary/85 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.13_80/0.18),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="gold-divider text-white/90">
            <span>Vida sacramental</span>
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] text-white">
            Los <span className="italic text-gold">Sacramentos</span><br />
            en nuestra parroquia
          </h1>
          <p className="mt-7 max-w-2xl mx-auto text-white/80 text-lg leading-relaxed">
            Signos eficaces de la gracia, instituidos por Cristo y confiados a la Iglesia. Conoce los requisitos y cómo prepararte para recibirlos.
          </p>
          <div className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-sm text-white/90">
            <Clock size={16} className="text-gold" />
            <span>Secretaría: Lunes a sábado · 3:00 PM – 6:00 PM</span>
          </div>
        </div>
      </section>

      {/* SACRAMENTOS GRID */}
      <section className="py-20 md:py-24 px-5 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Requisitos</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-medium">
              Pulsa cada sacramento para ver los detalles
            </h2>
          </Reveal>

          <Reveal>
            <Accordion type="single" collapsible className="space-y-4">
              {sacramentos.map((s) => {
                const Icon = s.icon;
                return (
                  <AccordionItem
                    key={s.id}
                    value={s.id}
                    id={s.id}
                    className="border border-border bg-card rounded-2xl shadow-card overflow-hidden px-6 scroll-mt-24"
                  >
                    <AccordionTrigger className="py-6 hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <span className="h-12 w-12 rounded-xl bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-card shrink-0">
                          <Icon size={22} />
                        </span>
                        <div>
                          <h3 className="font-display text-2xl text-primary">{s.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{s.intro}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-7">
                      <div className="pl-16 space-y-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Requisitos</p>
                          <ul className="space-y-2.5">
                            {s.requisitos.map((r, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                                <CheckCircle2 size={16} className="text-gold mt-0.5 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm bg-secondary/60 rounded-lg p-4">
                          <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                          <p className="text-foreground/85">{s.horario}</p>
                        </div>
                        {s.nota && (
                          <p className="text-xs italic text-muted-foreground border-l-2 border-gold pl-3">
                            {s.nota}
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-5 lg:px-8 bg-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">¿Tienes dudas?</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-medium">
              Conversa con nosotros
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Las puertas de la parroquia están abiertas. Llámanos o acércate a acompañarte en este paso de fe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href="tel:+51915049850"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-primary-foreground font-semibold shadow-card hover:shadow-elegant transition-shadow"
              >
                <Phone size={18} /> +51 915 049 850
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER mínimo */}
      <footer className="bg-primary text-primary-foreground py-10 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="" className="h-9 w-9" />
            <div>
              <p className="font-display text-base text-white">Santísima Trinidad</p>
              <p className="text-[11px] text-white/60 uppercase tracking-widest">Tingo · Arequipa</p>
            </div>
          </div>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Parroquia Santísima Trinidad de Tingo
          </p>
        </div>
      </footer>

      <WhatsAppFab />
    </div>
  );
}
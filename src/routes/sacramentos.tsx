import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Droplets,
  Cookie,
  HeartHandshake,
  Heart,
  HandHeart,
  Cross,
  Flame,
  Phone,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Users,
  FileText,
  ChevronRight,
  Facebook, Instagram,
  Mail,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/site/Reveal";

const SITE_URL = "https://parroquiatrinidadtingo.vercel.app";

/* ─────────────────────── DATOS ─────────────────────── */

const sacramentos = [
  {
    id: "bautismo",
    icon: Droplets,
    title: "Bautismo",
    color: "#3B7A8C",
    intro:
      "Puerta de entrada a la vida cristiana. Por el agua y el Espíritu nacemos a la fe.",
    descripcion:
      "Por el Bautismo somos hijos de Dios, miembros de la Iglesia y herederos de la vida eterna.",
    requisitos: [
      "Copia de DNI.",
      "Recibo de agua y recibo de luz (ambos obligatorios).",
      "Padrinos casados por la Iglesia, o padrinos solteros confirmados.",
      "Si son padrinos solteros, presentar constancia de confirmación.",
      "Asistir a la charla pre-bautismal (padres y padrinos).",
    ],
    informacion: {
      cuando: "Todos los sábados desde las 3:00 pm, previa programación.",
      donde: "En el templo parroquial.",
      padrinos: "Máximo 2 padrinos.",
      anticipacion: "Con al menos 1 mes de anticipación.",
    },
    horario: "Solicitar con un mínimo de 1 mes de anticipación.",
    nota: "Para bautismos de mayores de 8 años se requiere asistir a catequesis.",
    faq: [
      {
        q: "¿Pueden ser padrinos si no son casados por la Iglesia?",
        a: "Sí, pueden ser padrinos siempre que sean solteros confirmados y lleven una vida acorde a la fe católica.",
      },
      {
        q: "¿Cuántos padrinos puede tener mi hijo(a)?",
        a: "Puede tener uno (1) o dos (2) padrinos, como máximo.",
      },
      {
        q: "¿Los padres y padrinos deben asistir a la charla?",
        a: "Sí, es un requisito indispensable para comprender el significado del sacramento y asumir el compromiso cristiano.",
      },
    ],
    tiempo: "Inscribirse con 1 mes de anticipación.",
  },
  {
    id: "primera-comunion",
    icon: Cookie,
    color: "#C8A030",
    title: "Eucaristía",
    intro:
      "Encuentro con el Señor presente en la Eucaristía. Pan de vida para el camino.",
    descripcion:
      "Recibir el don del Espíritu Santo. Jesús se hace presente en la Eucaristía.",
    requisitos: [
      "Edad mínima: 9 años.",
      "Catequesis de 1 año.",
      "Pago de inscripción.",
      "Presentar la documentación requerida por secretaría.",
    ],
    informacion: {
      cuando: "Según calendario de catequesis.",
      donde: "En el templo parroquial.",
      padrinos: "No aplica para este sacramento.",
      anticipacion: "Inicio de catequesis: marzo de cada año.",
    },
    horario: "Inscripciones en secretaría parroquial.",
    faq: [
      {
        q: "¿Cuánto dura la catequesis?",
        a: "La catequesis de Eucaristía tiene una duración de 1 año.",
      },
      {
        q: "¿Cuál es la edad mínima?",
        a: "El niño o la niña debe tener al menos 9 años cumplidos.",
      },
    ],
    tiempo: "Inicio de catequesis: marzo de cada año.",
  },
  {
    id: "confirmacion",
    icon: Flame,
    color: "#D4652A",
    title: "Confirmación",
    intro:
      "Confirmación en la fe. El Espíritu Santo sella y fortalece al cristiano para ser testigo de Cristo.",
    descripcion:
      "El sacramento que fortalece la gracia bautismal. El Espíritu Santo nos da sus dones para vivir y defender la fe.",
    requisitos: [
      "Edad mínima: 14 años o cursar 3ro de secundaria.",
      "Catequesis de 2 años aproximadamente.",
      "Pago de inscripción.",
      "Partida de Nacimiento del joven (original y actualizada).",
      "Partida de Bautismo del joven (original y actualizada).",
      "Padrinos casados por la Iglesia, o padrinos solteros confirmados no convivientes.",
      "Ambos padrinos casados o solteros, presentar partida de confirmación.",
    ],
    informacion: {
      cuando: "Según calendario de catequesis.",
      donde: "En el templo parroquial.",
      padrinos: "Máximo 2 padrinos.",
      anticipacion: "Inicio de catequesis: abril de cada año.",
    },
    horario: "Inscripciones en secretaría parroquial.",
    nota: "Para confirmación de adultos mayores de 19 años, la catequesis tiene una duración aproximada de 6 meses, iniciando en el mes de mayo de cada año.",
    faq: [
      {
        q: "¿Cuánto dura la catequesis?",
        a: "La catequesis de Confirmación tiene una duración aproximada de 2 años para jóvenes, y 6 meses para adultos mayores de 19 años.",
      },
      {
        q: "¿Qué requisitos tienen los padrinos?",
        a: "Los padrinos deben ser casados por la Iglesia, o solteros confirmados no convivientes. Ambos deben presentar su partida de confirmación.",
      },
    ],
    tiempo: "Inicio de catequesis: abril de cada año.",
  },
  {
    id: "matrimonio",
    icon: HeartHandshake,
    color: "#7A3B3B",
    title: "Matrimonio",
    intro:
      "Alianza de amor entre un varón y una mujer, signo del amor de Cristo por su Iglesia.",
    descripcion:
      "Alianza de amor bendecida por Dios. Signo del amor de Cristo por su Iglesia.",
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
    informacion: {
      cuando: "Previa coordinación con el párroco.",
      donde: "En el templo parroquial.",
      padrinos: "Padrinos casados por la Iglesia.",
      anticipacion: "Inscribirse con 3 meses de anticipación.",
    },
    horario: "Atención para preparación: lunes a sábado de 3:00 a 6:00 PM.",
    faq: [
      {
        q: "¿Cuánto tiempo antes debo inscribirme?",
        a: "Se requiere una inscripción con anticipación mínima de 90 días (3 meses).",
      },
      {
        q: "¿Qué documentos necesito de mis padrinos?",
        a: "Los padrinos deben estar casados por la Iglesia y presentar su partida de matrimonio religioso.",
      },
    ],
    tiempo: "Inscribirse con 3 meses de anticipación.",
  },
  {
    id: "reconciliacion",
    icon: Heart,
    color: "#4A7C59",
    title: "Penitencia (Confesión)",
    intro:
      "El abrazo misericordioso del Padre que perdona y restaura.",
    descripcion:
      "El perdón de Dios que nos devuelve la paz. El abrazo misericordioso del Padre.",
    requisitos: [
      "No requiere inscripción previa.",
      "Examen de conciencia, arrepentimiento y propósito de enmienda.",
    ],
    informacion: {
      cuando: "Antes o después de cada misa.",
      donde: "En el confesionario del templo.",
      padrinos: "No aplica.",
      anticipacion: "Previo en la celebración de la Eucaristía.",
    },
    horario: "Antes o después de misa.",
    faq: [
      {
        q: "¿Necesito cita previa?",
        a: "No, puede acercarse antes o después de cualquier misa para confesarse.",
      },
    ],
    tiempo: "Previo a la celebración de Eucaristía.",
  },
  {
    id: "uncion",
    icon: HandHeart,
    color: "#6B6B3D",
    title: "Unción de los Enfermos",
    intro:
      "Consuelo y fortaleza para quienes atraviesan enfermedad grave o edad avanzada.",
    descripcion:
      "Fortaleza y consuelo en la enfermedad. Consuelo para quienes atraviesan enfermedad grave.",
    requisitos: [
      "Solicitar al sacerdote en cualquier momento.",
      "Indicar dirección y estado del enfermo.",
    ],
    informacion: {
      cuando: "En cualquier momento de necesidad.",
      donde: "A domicilio o en el templo.",
      padrinos: "No aplica.",
      anticipacion: "Llamar a la oficina parroquial con la dirección del enfermo.",
    },
    horario:
      "Atención a domicilio coordinando por teléfono o en secretaría.",
    faq: [
      {
        q: "¿Se puede solicitar a domicilio?",
        a: "Sí, el sacerdote puede acudir al domicilio del enfermo. Coordine por teléfono o en secretaría.",
      },
    ],
    tiempo: "Llamar a la oficina parroquial con la dirección del enfermo.",
  },
  {
    id: "orden",
    icon: Cross,
    color: "#5C3D6E",
    title: "Orden Sacerdotal",
    intro:
      "Vocación al servicio del Pueblo de Dios como diácono, presbítero u obispo.",
    descripcion:
      "Vocación al servicio del Pueblo de Dios como diácono, presbítero u obispo.",
    requisitos: [
      "Discernimiento vocacional con un sacerdote acompañante.",
      "Formación en el seminario diocesano.",
    ],
    informacion: {
      cuando: "Proceso continuo de discernimiento.",
      donde: "Con el párroco y en el seminario diocesano.",
      padrinos: "No aplica.",
      anticipacion: "Conversar con el párroco para acompañamiento vocacional.",
    },
    horario: "Conversa con el párroco para acompañamiento vocacional.",
    faq: [
      {
        q: "¿Cómo inicio el proceso?",
        a: "El primer paso es conversar con el párroco, quien lo guiará en el discernimiento vocacional.",
      },
    ],
    tiempo: "Conversar con el párroco para acompañamiento.",
  },
];

/* ─────────────────── ROUTE ─────────────────── */

export const Route = createFileRoute("/sacramentos")({
  head: () => ({
    meta: [
      { title: "Sacramentos · Parroquia Santísima Trinidad de Tingo" },
      {
        name: "description",
        content:
          "Requisitos para Bautismo, Eucaristía, Matrimonio, Penitencia (Confesión), Unción y Orden en la Parroquia Santísima Trinidad de Tingo, Arequipa.",
      },
      {
        property: "og:title",
        content: "Sacramentos · Parroquia Santísima Trinidad",
      },
      {
        property: "og:description",
        content:
          "Conoce los requisitos y horarios para recibir los sacramentos en nuestra parroquia.",
      },
      { property: "og:url", content: `${SITE_URL}/sacramentos` },
      { property: "og:type", content: "article" },
      {
        property: "og:image",
        content: `${SITE_URL}/assets/og-sacramentos.jpg`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: `${SITE_URL}/assets/og-sacramentos.jpg`,
      },
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

/* ─────────────────── PAGE ─────────────────── */

function SacramentosPage() {
  const [selected, setSelected] = useState(sacramentos[0]);
  const detalleRef = useRef<HTMLDivElement>(null);

  // Si llegan con un hash (#primera-comunion, #matrimonio, etc.) abrimos ese
  // sacramento directamente y bajamos a sus requisitos, no al general.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", "")).trim();
    if (!hash) return;
    const found = sacramentos.find((s) => s.id === hash);
    if (!found) return;
    setSelected(found);
    // Esperamos al re-render para hacer scroll al detalle
    requestAnimationFrame(() => {
      detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0F1B2D]">
      <Navbar forceBackground />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-24 overflow-hidden">
        {/* Background: imagen de manos con cáliz — reemplazar src con tu imagen real */}
        <div className="relative h-[340px] md:h-[420px] w-full">
          <img
            src="/assets/hero-sacramentos.jpg"
            loading="lazy"
            alt="Manos sosteniendo el cáliz sagrado"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2D]/80 via-[#0F1B2D]/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-end pb-10 px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-10 h-[2px] bg-[#C8A45C]" />
              <span className="text-[#C8A45C] text-xs uppercase tracking-[0.3em] font-semibold">
                Vida sacramental
              </span>
            </div>
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05]"
              style={{ fontStyle: "italic" }}
            >
              Sacramentos
            </h1>
            <p className="mt-2 text-white/75 text-base md:text-lg max-w-md">
              Encuentros con la gracia de Dios
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ NUESTROS SACRAMENTOS — GRID ════════════════ */}
      <section className="py-16 md:py-20 px-5 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
              <span className="text-[#C8A45C] text-xs uppercase tracking-[0.3em] font-semibold">
                Fe y gracia
              </span>
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#0F1B2D]">
              Nuestros Sacramentos
            </h2>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5">
              {sacramentos.map((s) => {
                const Icon = s.icon;
                const isActive = selected.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`group flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 w-[130px] sm:w-[145px] ${
                      isActive
                        ? "border-[#C8A45C] bg-[#E8EEF4] shadow-md"
                        : "border-[#CBD5E1] bg-white hover:border-[#C8A45C]/50 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className="h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: s.color + "18" }}
                    >
                      <Icon size={22} style={{ color: s.color }} />
                    </span>
                    <h3 className="font-display text-xs font-semibold text-[#0F1B2D] leading-tight">
                      {s.title}
                    </h3>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ DETALLE DEL SACRAMENTO SELECCIONADO ════════════════ */}
      <section className="py-16 md:py-20 px-5 lg:px-8 bg-[#F0F4F8] scroll-mt-20">
        <div ref={detalleRef} className="max-w-6xl mx-auto">
          <Reveal key={selected.id}>
            <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
              {/* Imagen lateral */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/4] min-h-[220px] lg:min-h-[360px]">
                {/* Reemplazar src con imagen real del sacramento */}
                <img
                  src={`/assets/sacramento-${selected.id}.${selected.id === 'confirmacion' ? 'png' : 'jpg'}`}
                  alt={selected.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2D]/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3
                    className="font-display text-3xl text-white font-medium"
                    style={{ fontStyle: "italic" }}
                  >
                    {selected.title}
                  </h3>
                  <p className="mt-1 text-white/80 text-sm text-justify">
                    {selected.descripcion}
                  </p>
                </div>
              </div>

              {/* Contenido detallado */}
              <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden">
                {/* Contenido en 3 columnas */}
                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#CBD5E1]">
                  {/* Col 1: Requisitos */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={14} className="text-[#C8A45C]" />
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#0F1B2D]">Requisitos</span>
                    </div>
                    <ul className="space-y-3">
                      {selected.requisitos.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-[#1A2940]/85"
                        >
                          <CheckCircle2
                            size={15}
                            style={{ color: selected.color }}
                            className="mt-0.5 shrink-0"
                          />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                    {selected.nota && (
                      <p className="mt-4 text-xs italic text-[#7B8A9E] border-l-2 border-[#C8A45C] pl-3">
                        {selected.nota}
                      </p>
                    )}
                  </div>

                  {/* Col 2: Información */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-[#C8A45C]" />
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#0F1B2D]">Información</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Calendar
                        size={15}
                        className="text-[#C8A45C] mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F1B2D] uppercase tracking-wide">
                          ¿Cuándo?
                        </p>
                        <p className="text-sm text-[#5A6A7E] mt-0.5">
                          {selected.informacion.cuando}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={15}
                        className="text-[#C8A45C] mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F1B2D] uppercase tracking-wide">
                          ¿Dónde?
                        </p>
                        <p className="text-sm text-[#5A6A7E] mt-0.5">
                          {selected.informacion.donde}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Users
                        size={15}
                        className="text-[#C8A45C] mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F1B2D] uppercase tracking-wide">
                          ¿Padrinos?
                        </p>
                        <p className="text-sm text-[#5A6A7E] mt-0.5">
                          {selected.informacion.padrinos}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock
                        size={15}
                        className="text-[#C8A45C] mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F1B2D] uppercase tracking-wide">
                          ¿Cuánto antes?
                        </p>
                        <p className="text-sm text-[#5A6A7E] mt-0.5">
                          {selected.informacion.anticipacion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Acciones */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-[#C8A45C]" />
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#0F1B2D]">Acciones</span>
                    </div>
                    <a
                      href="tel:+51915049850"
                      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: selected.color }}
                    >
                      <Phone size={16} />
                      Contactar secretaría
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ PREGUNTAS FRECUENTES ════════════════ */}
      <section className="py-16 md:py-20 px-5 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
              <span className="text-[#C8A45C] text-xs uppercase tracking-[0.3em] font-semibold">
                Dudas comunes
              </span>
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#0F1B2D]">
              Preguntas frecuentes
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {(selected.faq ?? []).map((item, i) => (
                <div
                  key={i}
                  className="bg-[#E8EEF4] rounded-2xl border border-[#CBD5E1] p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: selected.color }}
                    >
                      ?
                    </span>
                    <h4 className="font-display text-sm font-semibold text-[#0F1B2D] leading-snug">
                      {item.q}
                    </h4>
                  </div>
                  <p className="text-sm text-[#5A6A7E] leading-relaxed pl-11 text-justify">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ TIEMPOS RECOMENDADOS ════════════════ */}
      <section className="py-16 md:py-20 px-5 lg:px-8 bg-[#F0F4F8]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
              <span className="text-[#C8A45C] text-xs uppercase tracking-[0.3em] font-semibold">
                Planifica
              </span>
              <span className="block w-8 h-[2px] bg-[#C8A45C]" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#0F1B2D]">
              Tiempos recomendados
            </h2>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap justify-center gap-4">
              {sacramentos.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-[#CBD5E1] p-4 text-center w-[130px] sm:w-[145px]"
                  >
                    <span
                      className="inline-flex h-10 w-10 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: s.color + "15" }}
                    >
                      <Icon size={20} style={{ color: s.color }} />
                    </span>
                    <h4 className="font-display text-xs font-bold text-[#0F1B2D] mb-1">
                      {s.title}
                    </h4>
                    <p className="text-[10px] text-[#5A6A7E] leading-snug">
                      {s.tiempo}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ CTA CONTACTO ════════════════ */}
      <section className="py-16 px-5 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="bg-[#E8EEF4] border border-[#CBD5E1] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-medium text-[#0F1B2D]">
                  ¿Necesitas ayuda o tienes dudas?
                </h3>
                <p className="mt-2 text-sm text-[#5A6A7E] max-w-md text-justify">
                  Estamos para acompañarte en tu camino de fe. Llámanos o
                  acércate a la secretaría parroquial.
                </p>
              </div>
              <a
                href="tel:+51915049850"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C8A45C] text-white font-semibold text-sm shadow-md hover:bg-[#B8943E] transition-colors shrink-0"
              >
                <Phone size={18} />
                +51 915 049 850
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-[#0F1B2D] text-white/80 py-12 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Columna 1: Logo & misión */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/logo.webp"
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded-full overflow-hidden object-cover"
                />
                <div>
                  <p className="font-display text-sm text-white font-semibold">
                    Parroquia Santísima
                  </p>
                  <p className="font-display text-sm text-white font-semibold">
                    Trinidad de Tingo
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Amar a Dios, servir a los demás y anunciar el Evangelio.
              </p>
            </div>
                {/* Columna 3: Contáctanos */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C8A45C] font-semibold mb-4">
                Contáctanos
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-white/60">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#C8A45C]" />
                  {/* PLACEHOLDER: Reemplazar con dirección real si es diferente */}
                  <span>Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado</span>
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <Phone size={14} className="shrink-0 text-[#C8A45C]" />
                  <span>+51 915 049 850</span>
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <Mail size={14} className="shrink-0 text-[#C8A45C]" />
                  <span>pstrinidadtingo@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Síguenos */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C8A45C] font-semibold mb-4">
                Síguenos
              </p>
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
                  <p className="text-white/75 text-sm">pstrinidadtingo@gmail.com</p>
                </div>
              </li>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Parroquia Santísima Trinidad de
              Tingo — Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
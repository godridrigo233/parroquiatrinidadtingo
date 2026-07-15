import { Clock, MapPin, Phone, Facebook, Instagram, Mail } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export default function ContactoSection() {
  return (
    <>
      <section id="contacto" className="py-24 px-5 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Visítanos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium text-white">Estamos aquí para ti</h2>
            <p className="mt-5 text-white/80 leading-relaxed max-w-lg">
              Las puertas de la parroquia están abiertas. Acércate, conversa con nosotros y forma parte de esta gran familia.
            </p>

            <div className="mt-6 p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-gold shrink-0"><Clock size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Horario de atención en secretaría</p>
                  <p className="text-white/75 text-sm">Lunes a sábado · 3:00 PM – 6:00 PM</p>
                </div>
              </div>
            </div>

            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><MapPin size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Dirección</p>
                  <p className="text-white/75 text-sm">Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0"><Phone size={20} /></span>
                <div>
                  <p className="font-semibold text-white">Teléfono</p>
                  <a href="tel:+51915049850" className="text-white/75 text-sm hover:text-gold">+51 915 049 850</a>
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
                  <p className="text-white/75 text-sm">pstrinidadtingo@gmail.com</p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-2xl overflow-hidden shadow-elegant border border-white/10 aspect-[4/3] bg-white/5">
              <iframe title="Mapa parroquia" src="https://www.google.com/maps?q=Americas+1820,+Arequipa+04011,+Peru&output=embed" className="w-full h-full" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground border-t border-white/10 py-12 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src="/assets/logo.webp" alt="" className="h-12 w-12 rounded-full overflow-hidden object-cover" loading="lazy" />
              <div>
                <p className="font-display text-lg text-white">Parroquia Santísima Trinidad</p>
                <p className="text-xs text-white/60 uppercase tracking-widest">Tingo · Arequipa</p>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Horarios y Contacto</p>

            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>Domingos · 8:00 AM y 6:00 PM</li>
              <li>Lun – Vie · 6:00 PM</li>
              <li>Sábado · 6:00 PM (vigilia)</li>
            </ul>

            <div className="my-3 border-t border-white/10" />

            <ul className="space-y-2 text-sm text-white/75">
              <li>Secretaría: Lun – Sáb · 3:00 – 6:00 PM</li>
              <li>
                Tel: <a href="tel:+51915049850" className="hover:text-white hover:underline transition-colors">+51 915 049 850</a>{" "}
                <span className="text-white/50">(solo llamadas)</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white uppercase tracking-widest text-xs">Redes Sociales</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm">
                <Facebook size={16} /> Facebook
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm">
                <Instagram size={16} /> Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Parroquia Santísima Trinidad de Tingo.
        </div>
      </footer>
    </>
  );
}

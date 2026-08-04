import { Clock, MapPin, Phone, Facebook, Instagram, Mail } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ComoLlegarCard } from "@/components/site/ComoLlegarCard";
import { Footer } from "@/components/site/Footer";

export default function ContactoSection() {
  return (
    <>
      <section id="contacto" className="py-24 px-5 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          
          {/* ── COLUMNA 1: Información de Secretaría y Redes ── */}
          <Reveal>
            <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Visítanos</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium text-white">Estamos aquí para ti</h2>
            <p className="mt-5 text-white/80 leading-relaxed max-w-lg">
              Las puertas de la parroquia están abiertas. Acércate, conversa con nosotros y forma parte de esta gran familia.
            </p>

            <div className="mt-6 p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <Clock size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Horario de atención en secretaría</p>
                  <p className="text-white/90 text-sm">Lunes a sábado · 3:00 PM – 6:00 PM</p>
                </div>
              </div>
            </div>

            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Dirección</p>
                  <p className="text-white/90 text-sm">Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Teléfono</p>
                  <a href="tel:+51915049850" className="text-white/90 text-sm hover:text-gold transition-colors">+51 915 049 850</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <Facebook size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Facebook</p>
                  <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="text-white/90 text-sm hover:text-gold transition-colors">@parroquiasantisimatrinidadtingo</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <Instagram size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Instagram</p>
                  <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="text-white/90 text-sm hover:text-gold transition-colors">@stma_trinidad_tingo</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                  <Mail size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">Correo</p>
                  <a href="mailto:pstrinidadtingo@gmail.com" className="text-white/90 text-sm hover:text-gold transition-colors">pstrinidadtingo@gmail.com</a>
                </div>
              </li>
            </ul>
          </Reveal>

          {/* ── COLUMNA 2: Mapa y Tarjeta de Navegación agrupados ── */}
          <Reveal delay={150}>
            <div className="space-y-6">
              
              {/* Contenedor del Mapa con el iframe limpio */}
              <div className="rounded-2xl overflow-hidden shadow-elegant border border-white/10 aspect-[4/3] bg-white/5">
                <iframe 
                  title="Mapa de ubicación - Parroquia Santísima Trinidad de Tingo" 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.860511245394!2d-71.56416118821998!3d-16.431909184235895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91424aa2d977811b%3A0x8ce4e8c307c3facd!2sParroquia%20Sant%C3%ADsima%20Trinidad%2C%20Tingo!5e0!3m2!1ses-419!2spe!4v1784569640796!5m2!1ses-419!2spe" 
                  className="w-full h-full border-0" 
                  loading="lazy" 
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin" 
                />
              </div>
              
              {/* Tarjeta inteligente de Waze, Maps y buses del SIT */}
              <ComoLlegarCard />
              
            </div>
          </Reveal>

        </div>
      </section>

      <Footer />
    </>
  );
}
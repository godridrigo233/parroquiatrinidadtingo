import { Facebook, Instagram, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/site/sections/VideoSemanalSection";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-white/10 py-12 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/logo.webp" alt="" className="h-12 w-12 rounded-full overflow-hidden object-cover" loading="lazy" />
            <div>
              <p className="font-display text-lg text-white">Parroquia Santísima Trinidad</p>
              <p className="text-xs text-white/70 uppercase tracking-widest">Tingo · Arequipa</p>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white uppercase tracking-widest text-xs">Horarios y Contacto</p>

          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>Domingos · 8:00 AM y 6:00 PM</li>
            <li>Lun – Vie · 6:00 PM</li>
            <li>Sábado · 6:00 PM (vigilia)</li>
          </ul>

          <div className="my-3 border-t border-white/10" />

          <ul className="space-y-2 text-sm text-white/85">
            <li>Secretaría: Lun – Sáb · 3:00 – 6:00 PM</li>
            <li>
              Tel: <a href="tel:+51915049850" className="hover:text-white hover:underline transition-colors">+51 915 049 850</a>{" "}
              <span className="text-white/85">(solo llamadas)</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white uppercase tracking-widest text-xs">Redes Sociales y Canales</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://www.facebook.com/parroquiasantisimatrinidadtingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 text-xs sm:text-sm hover:bg-white/20 transition-colors">
              <Facebook size={15} /> Facebook
            </a>
            <a href="https://www.instagram.com/stma_trinidad_tingo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 text-xs sm:text-sm hover:bg-white/20 transition-colors">
              <Instagram size={15} /> Instagram
            </a>
            <a href="https://youtu.be/AZG4COJy9MQ?si=AnCM6gOXQaATDMHk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 text-xs sm:text-sm hover:bg-red-600/30 hover:text-white transition-colors">
              <Youtube size={15} className="text-red-400" /> YouTube
            </a>
            <a href="https://www.tiktok.com/@p.santisimatrinidadtingo?_r=1&_t=ZS-99TwHvEUaQf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 text-xs sm:text-sm hover:bg-white/20 transition-colors">
              <TikTokIcon className="w-3.5 h-3.5 text-white" /> TikTok
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/85">
        © {new Date().getFullYear()} Parroquia Santísima Trinidad de Tingo.
      </div>
    </footer>
  );
}

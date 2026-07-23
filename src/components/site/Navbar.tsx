import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, BookOpen, MessageCircle, Home, Church, Users, Heart, Music, CalendarDays, Image, Droplets, Phone, Mail, MapPin } from "lucide-react";
import { InstallPWA } from "@/components/site/InstallPWA";

const links = [
  { href: "inicio", label: "Inicio", icon: Home },
  { href: "parroquia", label: "Parroquia", icon: Church },
  { href: "sacerdotes", label: "Sacerdotes", icon: Users },
  { href: "devociones", label: "Devociones", icon: Heart },
  { href: "ministerios", label: "Ministerios", icon: Music },
  { href: "horarios", label: "Horarios", icon: CalendarDays },
  { href: "galeria", label: "Galería", icon: Image },
  { href: "sacramentos", label: "Sacramentos", icon: Droplets, route: true },
];

const EVANGELIO_URL = "https://www.vaticannews.va/es/evangelio-de-hoy.html";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Si no existe la sección (ej: estamos en otra ruta), navegar al home con hash
    window.location.href = `/#${id}`;
  }
}

function EvangelioDropdown({ bg }: { bg: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const compartirWhatsApp = () => {
    const texto = `✝ Evangelio del día: ${EVANGELIO_URL}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, "_blank");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Evangelio del día"
        title="Evangelio del día"
        className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors hover:border-gold hover:text-gold ${
          open
            ? "border-gold text-gold"
            : bg
            ? "border-border text-foreground/70"
            : "border-white/30 text-white/80"
        }`}
      >
        <span className="text-base leading-none select-none">✝</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-elegant overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Evangelio del día
          </p>
          <a
            href={EVANGELIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <BookOpen size={15} className="text-gold shrink-0" />
            Leer en Vatican News
          </a>
          <button
            onClick={compartirWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors border-t border-border/50"
          >
            <MessageCircle size={15} className="text-green-500 shrink-0" />
            Compartir por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar({ forceBackground }: { forceBackground?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 1024;
      const isTouchOrMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobileDevice(isSmallScreen && isTouchOrMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onLogoClick = () => {
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => (clicks.current = 0), 1500);
    if (clicks.current >= 5) {
      clicks.current = 0;
      navigate({ to: "/admin/login" });
    }
  };

  const bg = scrolled || forceBackground;

  const handleNavClick = useCallback((href: string, route?: boolean) => {
    if (route) {
      // Para rutas internas (Sacramentos), usar navigate
      navigate({ to: `/${href}` });
    } else {
      // Para anchors del home, scroll suave
      scrollToSection(href);
    }
    setOpen(false);
  }, [navigate]);

  const linkClass = (active = false) =>
    `text-sm font-medium transition-colors hover:text-gold cursor-pointer ${
      bg ? "text-foreground/80" : "text-white/90"
    } ${active ? "text-gold" : ""}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        bg
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 select-none"
          aria-label="Logo parroquia"
        >
          <img src={"/assets/logo.webp"} alt="" className="h-10 w-10 rounded-full overflow-hidden object-cover" />
          <div className="hidden sm:block leading-tight text-left">
            <p className={`font-display text-base font-semibold ${bg ? "text-foreground" : "text-white"}`}>
              Parroquia Santísima Trinidad
            </p>
            <p className={`text-[11px] uppercase tracking-widest ${bg ? "text-muted-foreground" : "text-white/80"}`}>
              Tingo - Arequipa
            </p>
          </div>
        </button>

        {/* NAVEGACIÓN DE ESCRITORIO */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) =>
            l.route ? (
              <Link key={l.href} to={`/${l.href}`} className={linkClass()} activeProps={{ className: "text-gold" }}>
                {l.label}
              </Link>
            ) : (
              <span key={l.href} onClick={() => handleNavClick(l.href)} className={linkClass()}>
                {l.label}
              </span>
            ),
          )}

          <EvangelioDropdown bg={!!bg} />

          <div className="flex items-center gap-3">
            {isMobileDevice && <InstallPWA />}
            <span
              onClick={() => handleNavClick("contacto")}
              className="px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-card hover:shadow-elegant transition-shadow cursor-pointer"
            >
              Visítanos
            </span>
          </div>
        </nav>

        {/* BOTÓN HAMBURUESA (Móvil) */}
        <div className="lg:hidden flex items-center gap-1">
          <EvangelioDropdown bg={!!bg} />
          <button
            onClick={() => setOpen((v) => !v)}
            className={`p-2 rounded-lg transition-colors ${bg ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/10"}`}
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ═══════════════════ OVERLAY ═══════════════════ */}
      <div
        className={`lg:hidden fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 pointer-events-auto ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* ═══════════════════ DRAWER MÓVIL ═══════════════════ */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 w-[300px] max-w-[85vw] bg-background border-l border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado del drawer */}
        <div className="px-5 pt-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.webp" alt="" className="h-9 w-9 rounded-full object-cover" />
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Parroquia Santísima Trinidad</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tingo - Arequipa</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {links.map((l) => {
            const Icon = l.icon;
            if (l.route) {
              return (
                <Link
                  key={l.href}
                  to={`/${l.href}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/60 transition-colors"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                    <Icon size={16} className="text-gold" />
                  </span>
                  {l.label}
                </Link>
              );
            }
            return (
              <span
                key={l.href}
                onClick={() => handleNavClick(l.href)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                  <Icon size={16} className="text-gold" />
                </span>
                {l.label}
              </span>
            );
          })}

          {/* Evangelio */}
          <a
            href={EVANGELIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/60 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <BookOpen size={16} className="text-gold" />
            </span>
            Evangelio del día
          </a>
        </nav>

        {/* Footer del drawer */}
        <div className="px-5 py-4 border-t border-border/50 space-y-3">
          {isMobileDevice && <InstallPWA />}

          <a
            href="tel:+51915049850"
            className="flex items-center gap-2.5 text-xs text-muted-foreground"
          >
            <Phone size={12} className="text-gold" />
            +51 915 049 850
          </a>
          <a
            href="mailto:pstrinidadtingo@gmail.com"
            className="flex items-center gap-2.5 text-xs text-muted-foreground"
          >
            <Mail size={12} className="text-gold" />
            pstrinidadtingo@gmail.com
          </a>
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <MapPin size={12} className="text-gold mt-0.5 shrink-0" />
            <span>Calle Ferrocarril 200, Tingo</span>
          </div>
        </div>
      </div>
    </header>
  );
}

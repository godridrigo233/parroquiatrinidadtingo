import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, BookOpen, MessageCircle } from "lucide-react";
import { InstallPWA } from "@/components/site/InstallPWA";

const links = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#parroquia", label: "Parroquia" },
  { href: "/#sacerdotes", label: "Sacerdotes" },
  { href: "/#devociones", label: "Devociones" },
  { href: "/#ministerios", label: "Ministerios" },
  { href: "/#horarios", label: "Horarios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/sacramentos", label: "Sacramentos", route: true },
];

const EVANGELIO_URL = "https://www.vaticannews.va/es/evangelio-de-hoy.html";

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
      {/* BOTÓN CRUZ */}
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

      {/* DROPDOWN */}
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
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const linkClass = (active = false) =>
    `text-sm font-medium transition-colors hover:text-gold ${
      bg ? "text-foreground/80" : "text-white/90"
    } ${active ? "text-gold" : ""}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        bg
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-card"
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
              <Link key={l.href} to={l.href} className={linkClass()} activeProps={{ className: "text-gold" }}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className={linkClass()}>
                {l.label}
              </a>
            ),
          )}

          {/* ✝ EVANGELIO — botón cruz con dropdown */}
          <EvangelioDropdown bg={!!bg} />

          {/* BOTONES DERECHOS */}
          <div className="flex items-center gap-3">
            <InstallPWA />
            <Link
              to="/"
              hash="contacto"
              className="px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-semibold shadow-card hover:shadow-elegant transition-shadow"
            >
              Visítanos
            </Link>
          </div>
        </nav>

        {/* BOTÓN HAMBURGUESA (Móvil) */}
        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={() => setOpen(!open)}
            className={`p-2 ${bg ? "text-foreground" : "text-white"}`}
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN MÓVIL */}
      {open && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="px-5 py-4 flex flex-col gap-1">
            {links.map((l) =>
              l.route ? (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-foreground/90 border-b border-border/50 text-sm"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-foreground/90 border-b border-border/50 text-sm"
                >
                  {l.label}
                </a>
              ),
            )}

            {/* ✝ EVANGELIO (Móvil) */}
            <a
              href={EVANGELIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-2.5 border-b border-border/50 text-sm flex items-center gap-2 text-foreground/90"
            >
              <BookOpen size={14} className="text-gold" />
              Evangelio del día
            </a>

            {/* BOTÓN PWA EN MÓVIL */}
            <div className="mt-4 flex flex-col gap-3">
              <InstallPWA />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
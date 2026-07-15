import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { InstallPWA } from "@/components/site/InstallPWA"; // ← Importación de tu botón

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

export function Navbar() {
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

  const linkClass = (active = false) =>
    `text-sm font-medium transition-colors hover:text-gold ${
      scrolled ? "text-foreground/80" : "text-white/90"
    } ${active ? "text-gold" : ""}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
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
            <p className={`font-display text-base font-semibold ${scrolled ? "text-foreground" : "text-white"}`}>
              Parroquia Santísima Trinidad
            </p>
            <p className={`text-[11px] uppercase tracking-widest ${scrolled ? "text-muted-foreground" : "text-white/80"}`}>
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
          
          {/* 👇 BOTONES DERECHOS (Escritorio) */}
          <div className="flex items-center gap-3">
            <InstallPWA /> {/* <--- Aquí va el botón de PWA */}
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
            className={`p-2 ${scrolled ? "text-foreground" : "text-white"}`}
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN MÓVIL (Menú desplegable) */}
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
            
            {/* 👇 BOTÓN PWA EN MÓVIL */}
            <div className="mt-4 flex flex-col gap-3">
               <InstallPWA /> {/* <--- El botón también se mostrará en el menú móvil */}
            </div>
            
          </nav>
        </div>
      )}
    </header>
  );
}
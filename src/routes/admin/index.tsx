import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceScanner } from "@/routes/admin/AttendanceScanner"; 
import { LogOut, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Administrador");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Si no hay sesión, lo mandamos al login
        navigate({ to: "/admin/login" });
        return;
      }

      // Extraemos el nombre real de la base de datos (o usamos el correo como respaldo)
      const nombreReal = user.user_metadata?.full_name || user.email?.split('@')[0] || "Administrador";
      setAdminName(nombreReal);
      setLoading(false);
    };

    verificarSesion();
  }, [navigate]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  // Generamos una fecha bonita (Ej: "jueves, 18 de junio")
  const hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return <div className="min-h-screen bg-secondary/20"></div>; // Pantalla limpia mientras carga
  }

  return (
    <div className="min-h-screen bg-secondary/30 font-sans pb-12">
      
      {/* 1. BARRA SUPERIOR (NAVBAR) ELEGANTE */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo y Nombre del Proyecto */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center shadow-inner">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-primary text-sm sm:text-base leading-tight">Parroquia Santísima Trinidad</h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Control de Asistencia</p>
            </div>
          </div>

          {/* Botón de Salir */}
          <div className="flex items-center gap-4">
            <button 
              onClick={cerrarSesion} 
              className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Tarjeta de Bienvenida (Hero Section) */}
        <div className="relative flex items-center justify-between bg-primary rounded-[2rem] p-8 sm:p-10 text-white shadow-elegant overflow-hidden">
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-primary-foreground/70 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">
              Panel Administrativo
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold flex items-center gap-3 mb-2">
              ¡Hola, {adminName.split(' ')[0]}! <Sparkles className="text-gold animate-pulse" size={28} />
            </h2>
            <p className="text-primary-foreground/90 text-sm font-medium capitalize">
              Hoy es {hoy}
            </p>
          </div>
          
          {/* Decoración abstracta de fondo en la tarjeta para darle el toque "Premium" */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute right-10 bottom-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl translate-y-1/3"></div>
        </div>

        {/* 3. CONTENEDOR DEL ESCÁNER (El componente que creamos antes) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <AttendanceScanner />
        </div>

      </main>
    </div>
  );
}
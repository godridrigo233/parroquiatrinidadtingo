import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail, User, AlertCircle, Link } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: LoginInterface,
});

function LoginInterface() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🛡️ ESTADOS DE SEGURIDAD
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // ⏱️ CONTROL DEL TEMPORIZADOR Y PERSISTENCIA (Inmune a recargas)
  useEffect(() => {
    // 1. Al cargar la página, revisar si hay un castigo guardado en el disco
    const savedLockUntil = localStorage.getItem("lockUntil");
    if (savedLockUntil) {
      const remaining = Math.floor((parseInt(savedLockUntil) - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTimer(remaining);
        setErrorMessage("Demasiados intentos. Acceso congelado temporalmente.");
      } else {
        // Si el tiempo ya pasó mientras estaba cerrado, limpiar la memoria
        localStorage.removeItem("lockUntil");
      }
    }

    // 2. Ejecutar la cuenta regresiva si está bloqueado
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            setErrorMessage("");
            localStorage.removeItem("lockUntil"); // Eliminar castigo
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockoutTimer]);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cortafuegos: Si está bloqueado, rechazar inmediatamente
    if (isLocked) return;
    
    setErrorMessage("");
    setLoading(true);

    if (isLoginMode) {
      // Proceso de Inicio de Sesión
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Lógica de Castigo
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 3) {
          setIsLocked(true);
          setLockoutTimer(30);
          // GUARDAR EN DISCO: Marcar el tiempo exacto en el futuro donde se liberará
          localStorage.setItem("lockUntil", (Date.now() + 30000).toString());
          setErrorMessage("Demasiados intentos. Acceso congelado temporalmente.");
        } else {
          setErrorMessage("Credenciales incorrectas. Verifica tu correo y contraseña.");
        }
        setLoading(false);
      } else {
        // Éxito: Limpiamos historial y entramos
        setFailedAttempts(0);
        localStorage.removeItem("lockUntil");
        navigate({ to: "/admin" });
      }
    } else {
      // Proceso de Registro (Crear Cuenta)
      if (!fullName.trim()) {
        setErrorMessage("El nombre completo es obligatorio.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim().toUpperCase(), 
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else {
        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        setIsLoginMode(true);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-elegant border border-border text-center relative overflow-hidden">
        
        {/* Indicador visual de bloqueo en la parte superior */}
        {isLocked && (
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
        )}

        <img src="/assets/logo.png" alt="Logo Parroquia" className="h-16 w-16 mx-auto mb-4" />
        <h2 className="font-display text-2xl text-primary flex items-center justify-center gap-2 mb-1">
          <Lock size={20} /> {isLoginMode ? "Panel administrador" : "Crear cuenta administrativa"}
        </h2>
        <p className="text-xs text-muted-foreground mb-6">Parroquia Santísima Trinidad</p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 text-left border border-red-100 animate-in fade-in zoom-in-95">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuthentication} className="space-y-4 text-left">
          {!isLoginMode && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3.5 text-muted-foreground/50" size={16} />
                <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  disabled={isLocked || loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-secondary/20 text-sm outline-none focus:border-gold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: RODRIGO GOMEZ" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correo</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3.5 text-muted-foreground/50" size={16} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked || loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-secondary/20 text-sm outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3.5 text-muted-foreground/50" size={16} />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked || loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-secondary/20 text-sm outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="********" />
            </div>
          </div>

          {/* Botón dinámico que cambia según el estado de bloqueo */}
          <button 
            type="submit" 
            disabled={loading || isLocked} 
            className={`w-full py-3 mt-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              isLocked 
                ? "bg-red-50 text-red-500 border border-red-200" 
                : "bg-gradient-gold text-primary hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {isLocked 
              ? `Bloqueado (${lockoutTimer}s)` 
              : loading 
                ? "Procesando..." 
                : isLoginMode 
                  ? "Iniciar Sesión" 
                  : "Registrar Cuenta"}
          </button>
        </form>

        <button 
          onClick={() => { setIsLoginMode(!isLoginMode); setErrorMessage(""); }} 
          disabled={isLocked}
          className="mt-5 text-xs text-primary font-medium hover:underline block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoginMode ? "¿No tienes cuenta? Crea una aquí" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        <Link to="/" className="mt-6 text-xs text-muted-foreground block hover:text-foreground">
          ← Volver al sitio público
        </Link>
      </div>
    </div>
  );
}
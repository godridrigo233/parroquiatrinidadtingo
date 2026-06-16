import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acceso administrador · Parroquia" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setError("Cuenta creada. Pide a un administrador que te asigne el rol 'admin' para acceder.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elegant p-8 border border-border">
        <div className="flex flex-col items-center text-center">
          {/* AQUÍ ESTÁ LA LÍNEA CORREGIDA */}
          <img src="/assets/logo.png" alt="" className="h-16 w-16" />
          <h1 className="mt-4 font-display text-2xl text-primary flex items-center gap-2">
            <Lock size={20} /> Panel administrador
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Parroquia Santísima Trinidad</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Correo</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg border border-input bg-background outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Contraseña</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="mt-1 w-full px-4 py-3 rounded-lg border border-input bg-background outline-none focus:border-gold" />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <button disabled={loading} type="submit"
            className="w-full py-3 rounded-lg bg-gradient-gold text-primary font-semibold shadow-card hover:shadow-elegant disabled:opacity-50 transition">
            {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>

          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-sm text-muted-foreground hover:text-primary">
            {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </form>

        <Link to="/" className="block mt-6 text-center text-xs text-muted-foreground hover:text-primary">
          ← Volver al sitio público
        </Link>
      </div>
    </div>
  );
}
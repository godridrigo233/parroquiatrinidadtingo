import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Definimos la estructura de nuestro contexto
type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

// Iniciamos asumiendo que está cargando (isLoading: true) para no expulsar a nadie por accidente
const AuthContext = createContext<AuthContextType>({ session: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Al cargar la app, buscamos la sesión actual en la memoria del navegador
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Nos suscribimos a cualquier cambio (login, logout, expiración)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsLoading(false);
    });

    // Limpieza de seguridad
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usarlo fácilmente en cualquier componente
export const useAuth = () => useContext(AuthContext);
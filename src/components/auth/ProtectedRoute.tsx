import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  // ESTADO 1: Verificando
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#140e72]">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  // ESTADO 2: Sin acceso (redirige a tu login exacto)
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // ESTADO 3: Acceso concedido (muestra el panel)
  return <>{children}</>;
}
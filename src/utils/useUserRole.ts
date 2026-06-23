import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<"admin" | "editor" | "secretaria" | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      // 1. Obtenemos el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingRole(false);
        return;
      }

      // 2. Buscamos su rol en la tabla que creaste
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setRole(data.role as "admin" | "editor" | "secretaria");
      }
      setLoadingRole(false);
    }

    fetchRole();
  }, []);

  return { role, loadingRole };
}
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: El tiempo que los datos se consideran "frescos" (no tocarán la BD en absoluto)
      // Lo configuramos a 30 minutos para ahorrar la cuota gratuita de Supabase al máximo
      staleTime: 1000 * 60 * 30, 

      // gcTime (Ex cacheTime): Cuánto tiempo se queda en la memoria del celular o PC tras cerrar la pestaña
      // Lo configuramos a 24 horas
      gcTime: 1000 * 60 * 60 * 24,

      // Si el internet de la parroquia o del móvil falla, reintentar la llamada 1 vez antes de dar error
      retry: 1,

      // Evita que la web haga un refetch agresivo a la BD si el usuario cambia a WhatsApp en el celular y vuelve al navegador
      refetchOnWindowFocus: false,
    },
  },
});
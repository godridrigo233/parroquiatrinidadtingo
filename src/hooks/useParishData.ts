import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('category, day_label, time_label, notes, sort_order')
        .order('sort_order');
        
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 60, 
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date');
        
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 15, 
  });
}
export function useMinistries() {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .order('created_at');
        
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
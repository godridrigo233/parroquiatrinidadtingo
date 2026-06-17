import { CalendarPlus } from "lucide-react";

export function AddToCalendar({ event }: { event: any }) {
  // Función para formatear fechas al estándar que piden los calendarios (YYYYMMDDTHHmmssZ)
  const formatTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const openGoogleCalendar = () => {
    const start = new Date(event.event_date);
    // Asumimos que un evento parroquial dura en promedio 1.5 horas
    const end = new Date(start.getTime() + 90 * 60 * 1000); 

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${formatTime(start)}/${formatTime(end)}`);
    
    if (event.description) url.searchParams.append('details', event.description);
    if (event.location) url.searchParams.append('location', event.location);

    window.open(url.toString(), '_blank');
  };

  return (
    <button 
      onClick={openGoogleCalendar}
      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-primary transition-colors text-xs font-medium uppercase tracking-wider border border-gold/20"
      title="Agregar a mi Google Calendar"
    >
      <CalendarPlus size={14} />
      Guardar en mi calendario
    </button>
  );
}
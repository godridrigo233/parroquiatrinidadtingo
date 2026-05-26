import { Phone } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="tel:+51915049850"
      aria-label="Llamar a la parroquia"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-gold text-primary-foreground shadow-elegant flex items-center justify-center hover:scale-110 transition-transform"
    >
      <Phone size={24} />
    </a>
  );
}

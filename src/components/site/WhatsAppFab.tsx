import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/51932269859?text=Hola%2C%20me%20comunico%20desde%20la%20web%20de%20la%20Parroquia%20Sant%C3%ADsima%20Trinidad"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elegant flex items-center justify-center hover:scale-110 transition-transform"
    >
      <MessageCircle size={26} />
    </a>
  );
}

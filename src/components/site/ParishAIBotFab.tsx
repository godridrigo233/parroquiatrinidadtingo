import { useState, useRef, useEffect } from "react";
import { MessageSquareText, X, Send, Bot, User, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ParishAIBotFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  // Empezamos con un mensaje de bienvenida estático
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Paz y bien! Soy el asistente virtual de la Parroquia Santísima Trinidad. ¿En qué te puedo ayudar hoy con nuestros horarios, eventos o sacramentos?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll hacia abajo cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Simulación del envío de mensaje (solo visual por ahora)
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    // Simulamos que el bot está "pensando" y responde
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Esta es una respuesta visual de prueba. ¡Pronto me conectarán al cerebro de IA! 🧠✨",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-50 flex flex-col items-end">
      
      {/* ─── VENTANA DEL CHAT ─── */}
      <div
        className={`mb-4 w-[calc(100vw-40px)] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-[#CBD5E1] overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none absolute"
        }`}
      >
        {/* Cabecera del Chat */}
        <div className="bg-[#0F1B2D] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C8A45C] to-[#9a7b40] flex items-center justify-center shadow-inner">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-display font-medium leading-none">Asistente Parroquial</h3>
              <p className="text-[#C8A45C] text-xs mt-1 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                En línea
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Área de Mensajes */}
        <div className="h-[350px] overflow-y-auto p-4 bg-[#F0F4F8] flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              {/* Avatar */}
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${msg.role === "user" ? "bg-[#0F1B2D] text-white" : "bg-white text-[#C8A45C]"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={18} />}
              </div>
              
              {/* Burbuja de texto */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-[#0F1B2D] text-white rounded-tr-sm" 
                  : "bg-white text-[#1A2940] border border-[#CBD5E1]/50 rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Texto */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#CBD5E1] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 bg-[#F0F4F8] text-sm text-[#0F1B2D] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A45C]/50 border border-transparent focus:border-[#C8A45C] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-10 w-10 rounded-full bg-[#C8A45C] text-white flex items-center justify-center shrink-0 hover:bg-[#B8943E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* ─── BOTÓN FLOTANTE (FAB) ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(15,27,45,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-[#0F1B2D] text-white rotate-90" : "bg-[#0F1B2D] text-[#C8A45C] hover:bg-[#1a2e4a]"
        }`}
      >
        {isOpen ? <X size={24} className="-rotate-90" /> : <MessageSquareText size={26} />}
      </button>

    </div>
  );
}
"use client";
import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { MessageSquareText, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

export function ParishAIBotFab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <ParishAIBotFabWidget />;
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

const WELCOME_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "¡Paz y bien! Soy el asistente virtual de la Parroquia Santísima Trinidad. ¿En qué te puedo ayudar hoy con nuestros horarios, eventos o sacramentos?",
    },
  ],
};

function ParishAIBotFabWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    messages: [WELCOME_MESSAGE],
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  };

  return (
    <div className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-50 flex flex-col items-end">

      {/* ─── VENTANA DEL CHAT ─── */}
      <div
        className={`mb-4 w-[calc(100vw-40px)] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-[#CBD5E1] overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-10 pointer-events-none absolute"
        }`}
      >
        {/* Cabecera */}
        <div className="bg-[#0F1B2D] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C8A45C] to-[#9a7b40] flex items-center justify-center shadow-inner">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-display font-medium leading-none">Asistente Parroquial (beta)</h3>
              <p className="text-[#C8A45C] text-xs mt-1 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
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

        {/* Mensajes */}
        <div className="h-[350px] overflow-y-auto p-4 bg-[#F0F4F8] flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                  msg.role === "user" ? "bg-[#0F1B2D] text-white" : "bg-white text-[#C8A45C]"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={18} />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#0F1B2D] text-white rounded-tr-sm"
                    : "bg-white text-[#1A2940] border border-[#CBD5E1]/50 rounded-tl-sm"
                }`}
              >
                {getMessageText(msg)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto">
              <div className="shrink-0 h-8 w-8 rounded-full bg-white text-[#C8A45C] flex items-center justify-center mt-1 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#CBD5E1]/50 rounded-tl-sm shadow-sm">
                <Loader2 size={16} className="animate-spin text-[#C8A45C]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-[#CBD5E1] flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            disabled={isLoading}
            className="flex-1 bg-[#F0F4F8] text-sm text-[#0F1B2D] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A45C]/50 border border-transparent focus:border-[#C8A45C] transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 w-10 rounded-full bg-[#C8A45C] text-white flex items-center justify-center shrink-0 hover:bg-[#B8943E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* ─── FAB ─── */}
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

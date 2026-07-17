"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { MessageSquareText, X, Send, Church, User } from "lucide-react";

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
      text: "¡Paz y bien! Soy el asistente virtual de la Parroquia Santísima Trinidad. Elige una opción o escribe tu pregunta sobre horarios, eventos o sacramentos.",
    },
  ],
};

const QUICK_REPLIES = [
  { label: "🕊️ Horarios de Misa", message: "¿Cuáles son los horarios de misa?" },
  { label: "✝️ Sacramentos", message: "Quisiera información sobre los sacramentos" },
  { label: "📅 Próximos eventos", message: "¿Qué eventos tienen próximamente?" },
  { label: "📍 Dirección y contacto", message: "¿Cuál es la dirección y el teléfono de la parroquia?" },
];

// Detects URLs, emails and phone numbers inside a bot reply and turns them into tappable links.
const RICH_TEXT_REGEX = /(https?:\/\/[^\s]+)|([\w.+-]+@[\w-]+\.[\w.-]+)|(\+?\d[\d\s-]{6,}\d)/g;

function renderRichText(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  RICH_TEXT_REGEX.lastIndex = 0;
  while ((match = RICH_TEXT_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const value = match[0];
    const linkClass = "underline underline-offset-2 decoration-[#C8A45C] hover:text-[#C8A45C] break-words";
    if (match[1]) {
      nodes.push(
        <a key={`${keyPrefix}-${i}`} href={value} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {value}
        </a>
      );
    } else if (match[2]) {
      nodes.push(
        <a key={`${keyPrefix}-${i}`} href={`mailto:${value}`} className={linkClass}>
          {value}
        </a>
      );
    } else if (match[3]) {
      nodes.push(
        <a key={`${keyPrefix}-${i}`} href={`tel:${value.replace(/[\s-]/g, "")}`} className={linkClass}>
          {value}
        </a>
      );
    }
    lastIndex = match.index + value.length;
    i++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1 py-1" aria-label="El asistente está escribiendo">
      <span className="h-1.5 w-1.5 rounded-full bg-[#C8A45C] animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#C8A45C] animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#C8A45C] animate-bounce" />
    </span>
  );
}

function ParishAIBotFabWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCountRef = useRef(1);

  const { messages, sendMessage, status } = useChat({
    messages: [WELCOME_MESSAGE],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Respect the user's OS-level motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Gentle, one-time invitation bubble if the visitor hasn't engaged yet.
  useEffect(() => {
    if (hasOpenedOnce || teaserDismissed) return;
    const showTimer = setTimeout(() => setShowTeaser(true), 3500);
    const hideTimer = setTimeout(() => setShowTeaser(false), 16000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [hasOpenedOnce, teaserDismissed]);

  // Badge the FAB with unread replies that arrive while the panel is closed.
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant" && !isOpen && hasOpenedOnce) {
        setUnread((u) => u + 1);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isOpen, hasOpenedOnce]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, isOpen, isLoading, reducedMotion]);

  // Auto-focus the input and allow Escape to close once the panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => textareaRef.current?.focus(), reducedMotion ? 0 : 320);
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => { clearTimeout(focusTimer); window.removeEventListener("keydown", onKeyDown); };
  }, [isOpen, reducedMotion]);

  // Auto-grow the textarea as the visitor types, capped at a sensible height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputValue]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setHasOpenedOnce(true);
    setUnread(0);
    setShowTeaser(false);
    setTeaserDismissed(true);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleQuickReply = (message: string) => {
    if (isLoading) return;
    sendMessage({ text: message });
  };

  const motionClass = reducedMotion ? "transition-opacity duration-150" : "transition-all duration-300";

  return (
    <div
      className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-50 flex flex-col items-end"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* ─── BURBUJA DE INVITACIÓN ─── */}
      {showTeaser && !isOpen && (
        <div className="mb-3 mr-1 max-w-[230px] bg-white rounded-2xl rounded-br-sm shadow-lg border border-[#CBD5E1] p-3 flex items-start gap-2">
          <p className="text-xs text-[#1A2940] leading-snug flex-1">
            ¿Tienes preguntas sobre horarios, sacramentos o eventos? Escríbenos 🙏
          </p>
          <button
            onClick={() => { setShowTeaser(false); setTeaserDismissed(true); }}
            className="text-[#94A3B8] hover:text-[#0F1B2D] shrink-0 -mt-0.5"
            aria-label="Cerrar mensaje"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── VENTANA DEL CHAT ─── */}
      <div
        role="dialog"
        aria-label="Asistente parroquial"
        className={`mb-4 w-[calc(100vw-40px)] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-[#CBD5E1] overflow-hidden origin-bottom-right ${motionClass} ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : `${reducedMotion ? "scale-100" : "scale-95"} opacity-0 translate-y-4 pointer-events-none absolute`
        }`}
      >
        {/* Cabecera */}
        <div className="bg-[#0F1B2D] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C8A45C] to-[#9a7b40] flex items-center justify-center shadow-inner">
              <Church size={19} className="text-white" />
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
            aria-label="Cerrar chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensajes */}
        <div
          className="h-[350px] overflow-y-auto p-4 bg-[#F0F4F8] flex flex-col gap-4"
          role="log"
          aria-live="polite"
        >
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
                {msg.role === "user" ? <User size={16} /> : <Church size={16} />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#0F1B2D] text-white rounded-tr-sm"
                    : "bg-white text-[#1A2940] border border-[#CBD5E1]/50 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? renderRichText(getMessageText(msg), msg.id) : getMessageText(msg)}
              </div>
            </div>
          ))}

          {/* Sugerencias rápidas: solo mientras no haya conversación */}
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 ml-[42px]">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleQuickReply(q.message)}
                  className="text-xs font-medium text-[#0F1B2D] bg-white border border-[#C8A45C]/40 rounded-full px-3 py-1.5 hover:bg-[#C8A45C]/10 hover:border-[#C8A45C] transition-colors shadow-sm"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto">
              <div className="shrink-0 h-8 w-8 rounded-full bg-white text-[#C8A45C] flex items-center justify-center mt-1 shadow-sm">
                <Church size={16} />
              </div>
              <div className="px-3.5 py-3 rounded-2xl bg-white border border-[#CBD5E1]/50 rounded-tl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-[#CBD5E1] flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Escribe tu pregunta aquí..."
            disabled={isLoading}
            aria-label="Escribe tu pregunta"
            className="flex-1 resize-none bg-[#F0F4F8] text-sm text-[#0F1B2D] rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A45C]/50 border border-transparent focus:border-[#C8A45C] transition-all disabled:opacity-60 max-h-[120px]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Enviar mensaje"
            className="h-10 w-10 rounded-full bg-[#C8A45C] text-white flex items-center justify-center shrink-0 hover:bg-[#B8943E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* ─── FAB ─── */}
      <div className="relative">
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white z-10">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <button
          onClick={handleToggle}
          aria-label={isOpen ? "Cerrar asistente parroquial" : "Abrir asistente parroquial"}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(15,27,45,0.3)] hover:scale-105 active:scale-95 ${motionClass} ${
            isOpen ? "bg-[#0F1B2D] text-white rotate-90" : "bg-[#0F1B2D] text-[#C8A45C] hover:bg-[#1a2e4a]"
          }`}
        >
          {isOpen ? <X size={24} className="-rotate-90" /> : <MessageSquareText size={26} />}
        </button>
      </div>
    </div>
  );
}
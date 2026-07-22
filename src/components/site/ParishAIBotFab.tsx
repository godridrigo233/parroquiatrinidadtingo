"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { 
  MessageSquareText, 
  X, 
  Send, 
  User, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  MessageCircle, 
  Sparkles 
} from "lucide-react";

export function ParishAIBotFab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
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
      text: "¡Paz y bien! Soy el Hermano Elías, tu asistente virtual. ¿En qué te puedo ayudar hoy sobre horarios, sacramentos o eventos? 🙏",
    },
  ],
};

// ── 1. SUGERENCIAS RÁPIDAS DINÁMICAS SEGÚN DÍA Y HORA ──
function getDynamicQuickReplies() {
  const now = new Date();
  const day = now.getDay(); // 0: Domingo, 6: Sábado
  const hour = now.getHours();

  if (day === 0 && hour < 13) {
    return [
      { label: "🙏 Horarios de misa hoy domingo", message: "¿Cuáles son los horarios de misa hoy domingo?" },
      { label: "📖 Evangelio del día", message: "¿Cuál es el evangelio o las lecturas de hoy?" },
      { label: "📍 Dirección y cómo llegar", message: "¿Cuál es la dirección de la parroquia y cómo llego?" },
    ];
  }
  if (day === 6 && hour >= 13) {
    return [
      { label: "⛪ Misa de vigilia hoy", message: "¿A qué hora es la misa de vigilia hoy sábado?" },
      { label: "🕊️ Requisitos para bautizos", message: "¿Cuáles son los requisitos y horarios para bautizos?" },
      { label: "📍 Dirección y contacto", message: "¿Cuál es la dirección y el teléfono de la parroquia?" },
    ];
  }
  if (day >= 1 && day <= 6 && hour >= 15 && hour < 18) {
    return [
      { label: "📞 Atención en secretaría", message: "¿La secretaría está atendiendo en este momento?" },
      { label: "🕊️ Horarios de Misa en la semana", message: "¿Cuáles son los horarios de misa de lunes a viernes?" },
      { label: "✝️ Sacramentos", message: "Quisiera información sobre los sacramentos" },
    ];
  }
  return [
    { label: "🕊️ Horarios de Misa", message: "¿Cuáles son los horarios de misa?" },
    { label: "✝️ Sacramentos", message: "Quisiera información sobre los sacramentos" },
    { label: "📅 Próximos eventos", message: "¿Qué eventos tienen próximamente?" },
    { label: "📍 Dirección y contacto", message: "¿Cuál es la dirección y el teléfono de la parroquia?" },
  ];
}

// ── 2. ZERO-LATENCY FALLBACK (RESPUESTAS INSTANTÁNEAS SIN IA) ──
function checkInstantAnswer(text: string): string | null {
  const clean = text.toLowerCase();
  if (/direcci[oó]n|d[oó]nde est[aá]n|ubicaci[oó]n|c[oó]mo llegar/i.test(clean)) {
    return "📍 Nuestra parroquia está ubicada en: Calle Ferrocarril 200, Av. Alfonso Ugarte Tingo - Cercado, Arequipa (Frente al parque principal de Tingo).\n\n🚌 ¿Cómo llegar? Puedes tomar el Bus Cuenca 10 (SIT) color granate/rojo con destino a Jacobo Hunter y bajar en el 'Cruce de Tingo'.";
  }
  if (/tel[eé]fono|celular|n[uú]mero.*secretar[ií]a|llamar/i.test(clean)) {
    return "📞 El teléfono oficial de nuestra secretaría parroquial es: +51 915 049 850.\n\n🕒 Horario de atención (presencial y telefónica): Lunes a Sábado de 3:00 PM a 6:00 PM.";
  }
  if (/qui[eé]n eres|qui[eé]n es el hermano el[ií]as|c[oó]mo te llamas/i.test(clean)) {
    return "¡Paz y bien! Soy el Hermano Elías, tu asistente parroquial virtual. Mi nombre rinde homenaje al Profeta Elías del Antiguo Testamento, padre espiritual y guía protector de toda la Orden del Carmelo (los Padres Carmelitas CMI que dirigen nuestra parroquia en Tingo). ¡Estoy aquí para servirte y guiarte en nuestra comunidad!";
  }
  return null;
}

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
    const linkClass = "underline underline-offset-2 decoration-[#C8A45C] hover:text-[#C8A45C] break-words font-medium";
    if (match[1]) {
      nodes.push(<a key={`${keyPrefix}-${i}`} href={value} target="_blank" rel="noopener noreferrer" className={linkClass}>{value}</a>);
    } else if (match[2]) {
      nodes.push(<a key={`${keyPrefix}-${i}`} href={`mailto:${value}`} className={linkClass}>{value}</a>);
    } else if (match[3]) {
      nodes.push(<a key={`${keyPrefix}-${i}`} href={`tel:${value.replace(/[\s-]/g, "")}`} className={linkClass}>{value}</a>);
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

const AVATAR_IMAGE_PATH = "/assets/hermano-elias-avatar.png";
const STORAGE_KEY_MSGS = "parish_bot_messages_v3";
const STORAGE_KEY_DATE = "parish_bot_date_v3";

function ParishAIBotFabWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // ── ESTADOS DE LAS NUEVAS MEJORAS ──
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("sm");
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState(getDynamicQuickReplies());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCountRef = useRef(1);

  const { messages, setMessages, sendMessage, status } = useChat({
    messages: [WELCOME_MESSAGE],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // ── 3. MEMORIA DE SESIÓN (EXPIRA AL ACABAR EL DÍA) ──
  useEffect(() => {
    try {
      const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
      const today = new Date().toISOString().split("T")[0];
      if (storedDate === today) {
        const savedMsgs = localStorage.getItem(STORAGE_KEY_MSGS);
        if (savedMsgs) {
          const parsed = JSON.parse(savedMsgs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } else {
        // Al día siguiente se limpia la memoria automáticamente
        localStorage.removeItem(STORAGE_KEY_MSGS);
        localStorage.setItem(STORAGE_KEY_DATE, today);
      }
    } catch (e) {
      console.error("Error cargando memoria del bot:", e);
    }
  }, [setMessages]);

  useEffect(() => {
    if (messages.length > 1) {
      try {
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(messages));
      } catch (e) {
        console.error("Error guardando memoria del bot:", e);
      }
    }
  }, [messages]);

  // Actualizar sugerencias dinámicas y accesibilidad en el OS
  useEffect(() => {
    setQuickReplies(getDynamicQuickReplies());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isOpen]);

  // Burbuja de invitación
  useEffect(() => {
    if (hasOpenedOnce || teaserDismissed) return;
    const showTimer = setTimeout(() => setShowTeaser(true), 3500);
    const hideTimer = setTimeout(() => setShowTeaser(false), 16000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hasOpenedOnce, teaserDismissed]);

  // Indicador de no leídos
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
    messagesEndRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages, isOpen, isLoading, reducedMotion, fontSize]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => textareaRef.current?.focus(), reducedMotion ? 0 : 320);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, reducedMotion]);

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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
      setInputValue("");
    }
  };
  // ── ENVÍO DE MENSAJES CON INTERCEPTOR DE CERO LATENCIA ──
  const handleSend = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    // Verificar si se puede responder gratis y en 5 milisegundos
    const instantReply = checkInstantAnswer(text);
    if (instantReply) {
      const userMsg: UIMessage = { id: Date.now().toString(), role: "user", parts: [{ type: "text", text }] };
      const botMsg: UIMessage = { id: (Date.now() + 1).toString(), role: "assistant", parts: [{ type: "text", text: instantReply }] };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      return;
    }

    // Si requiere razonamiento sacramental o complejo, llamamos a la API
    sendMessage({ text });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
    setInputValue("");
  };

  const handleQuickReply = (message: string) => {
    if (isLoading) return;
    handleSend(message);
  };

  // ── 4. LECTURA EN VOZ ALTA (TEXT TO SPEECH) ──
  const toggleSpeech = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-PE";
    utterance.rate = 0.95; // Velocidad ligeramente pausada para adultos mayores
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingMsgId(id);
  };

  // ── 5. DETECCIÓN PARA BOTONES DE ACCIÓN DIRECTA HACIA SECRETARÍA ──
  const shouldShowSecretariatButtons = (text: string): boolean => {
    return /915\s*049\s*850|secretar[ií]a|llamar|contacta directamente|matrimonio|bautismo|unc[ií][oó]n|partida/i.test(text);
  };

  // Mapeo de tamaño de letra de Tailwind
  const fontSizes = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
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
            ¿Dudas sobre horarios, sacramentos o eventos? Pregúntale al Hermano Elías 🙏
          </p>
          <button
            onClick={() => {
              setShowTeaser(false);
              setTeaserDismissed(true);
            }}
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
        className={`mb-4 w-[calc(100vw-40px)] sm:w-[390px] bg-white rounded-3xl shadow-2xl border border-[#CBD5E1] overflow-hidden origin-bottom-right ${motionClass} ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : `${reducedMotion ? "scale-100" : "scale-95"} opacity-0 translate-y-4 pointer-events-none absolute`
        }`}
      >
        {/* Cabecera con Avatar y Control de Tamaño de Letra */}
        <div className="bg-[#0F1B2D] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#C8A45C]/30">
          <div className="flex items-center gap-3">
            {/* ── 6. ANIMACIÓN DE "PENSANDO" EN EL AVATAR ── */}
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full border-2 border-white/80 flex items-center justify-center shadow-inner overflow-hidden shrink-0 transition-all ${
              isLoading ? "ring-4 ring-[#C8A45C] animate-pulse shadow-[0_0_15px_rgba(200,164,92,0.7)]" : ""
            }`}>
              <img
                src={AVATAR_IMAGE_PATH}
                alt="Avatar del Hermano Elías"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-white font-display font-medium leading-none text-base">
                  Hermano Elías
                </h3>
                {isLoading && <Sparkles size={13} className="text-[#C8A45C] animate-spin" />}
              </div>
              <p className="text-[#C8A45C] text-xs mt-1 flex items-center gap-1 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                {isLoading ? "Consultando archivos..." : "Asistente Parroquial"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* ── 7. BOTONES DE ACCESIBILIDAD A- / A+ PARA ADULTOS MAYORES ── */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/15">
              <button
                onClick={() => setFontSize((f) => (f === "lg" ? "base" : "sm"))}
                disabled={fontSize === "sm"}
                className="px-2 py-1 text-[11px] font-bold text-white/90 hover:text-white disabled:opacity-40 transition-opacity"
                title="Reducir letra"
              >
                A-
              </button>
              <span className="text-white/30 text-xs">|</span>
              <button
                onClick={() => setFontSize((f) => (f === "sm" ? "base" : "lg"))}
                disabled={fontSize === "lg"}
                className="px-2 py-1 text-xs font-bold text-[#C8A45C] hover:text-[#e0bb70] disabled:opacity-40 transition-opacity"
                title="Agrandar letra"
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors ml-0.5"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div
          className="h-[360px] overflow-y-auto p-4 bg-[#F0F4F8] flex flex-col gap-4"
          role="log"
          aria-live="polite"
        >
          {messages.map((msg) => {
            const rawText = getMessageText(msg);
            const showActionButtons = msg.role === "assistant" && shouldShowSecretariatButtons(rawText);

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-sm overflow-hidden ${
                    msg.role === "user" ? "bg-[#0F1B2D] text-white" : "bg-white border border-[#CBD5E1]/50"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={16} />
                  ) : (
                    <img
                      src={AVATAR_IMAGE_PATH}
                      alt="Avatar del Hermano Elías"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed shadow-sm whitespace-pre-wrap relative group ${fontSizes[fontSize]} ${
                      msg.role === "user"
                        ? "bg-[#0F1B2D] text-white rounded-tr-sm"
                        : "bg-white text-[#1A2940] border border-[#CBD5E1]/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? renderRichText(rawText, msg.id) : rawText}

                    {/* Botón de Lectura en Voz Alta (Solo en mensajes del asistente) */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => toggleSpeech(rawText, msg.id)}
                        className={`absolute -right-2 -bottom-2 h-7 w-7 rounded-full bg-white border border-[#CBD5E1] shadow-md flex items-center justify-center text-[#0F1B2D] hover:bg-[#C8A45C] hover:text-white hover:border-[#C8A45C] transition-colors ${
                          speakingMsgId === msg.id ? "bg-[#C8A45C] text-white animate-bounce" : "opacity-0 group-hover:opacity-100"
                        }`}
                        title={speakingMsgId === msg.id ? "Detener lectura" : "Leer en voz alta"}
                        aria-label="Leer en voz alta"
                      >
                        {speakingMsgId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>

                  {/* ── BOTONES DE ACCIÓN DIRECTA HACIA SECRETARÍA ── */}
                  {showActionButtons && (
                    <div className="flex flex-wrap gap-2 mt-0.5 animate-in fade-in duration-300">
                      <a
                        href="tel:+51915049850"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1B2D] text-white text-xs font-semibold shadow-sm hover:bg-[#1a2e4a] transition-all hover:scale-[1.02]"
                      >
                        <PhoneCall size={13} className="text-[#C8A45C]" />
                        <span>Llamar a Secretaría</span>
                      </a>
                      <a
                        href="https://wa.me/51915049850?text=Hola,%20vengo%20del%20asistente%20virtual%20de%20la%20web%20y%20quisiera%20hacer%20una%20consulta%20parroquial..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold shadow-sm hover:bg-[#20ba59] transition-all hover:scale-[1.02]"
                      >
                        <MessageCircle size={14} className="fill-white" />
                        <span>WhatsApp Secretaría</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sugerencias rápidas dinámicas: solo mientras no haya conversación */}
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 ml-[42px] pt-1">
              {quickReplies.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleQuickReply(q.message)}
                  className="text-xs font-medium text-[#0F1B2D] bg-white border border-[#C8A45C]/50 rounded-full px-3.5 py-2 hover:bg-[#C8A45C]/15 hover:border-[#C8A45C] transition-all shadow-sm hover:scale-[1.02] text-left"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto">
              <div className="shrink-0 h-8 w-8 rounded-full bg-white border border-[#CBD5E1]/50 flex items-center justify-center mt-1 shadow-sm overflow-hidden">
                <img
                  src={AVATAR_IMAGE_PATH}
                  alt="Avatar del Hermano Elías"
                  className="w-full h-full object-cover animate-pulse"
                />
              </div>
              <div className="px-3.5 py-3 rounded-2xl bg-white border border-[#CBD5E1]/50 rounded-tl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3 bg-white border-t border-[#CBD5E1] flex gap-2 items-end"
        >
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
            className="h-10 w-10 rounded-full bg-[#C8A45C] text-white flex items-center justify-center shrink-0 hover:bg-[#B8943E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>

      {/* ─── FAB ─── */}
      <div className="relative">
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white z-10 animate-bounce">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <button
          onClick={handleToggle}
          aria-label={
            isOpen ? "Cerrar asistente parroquial" : "Abrir asistente parroquial"
          }
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(15,27,45,0.35)] hover:scale-105 active:scale-95 border-2 border-[#C8A45C]/40 ${motionClass} ${
            isOpen
              ? "bg-[#0F1B2D] text-white rotate-90"
              : "bg-[#0F1B2D] text-[#C8A45C] hover:bg-[#1a2e4a]"
          }`}
        >
          {isOpen ? (
            <X size={24} className="-rotate-90" />
          ) : (
            <MessageSquareText size={26} />
          )}
        </button>
      </div>
    </div>
  );
}
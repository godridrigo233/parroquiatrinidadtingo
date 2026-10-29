import { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Printer, QrCode, Globe, Clock, BookOpen, Calendar, Check, ExternalLink, Sparkles } from "lucide-react";

const SITE_URL = "https://parroquiatrinidadtingo.vercel.app";

// Logo de alta resolución oficial de la parroquia (512x512)
const PARISH_HD_LOGO = "/pwa-512x512.png";

const PRESET_DESTINATIONS = [
  {
    id: "home",
    label: "Página Principal (Recomendado)",
    url: SITE_URL,
    description: "Acceso completo: Horarios, avisos, sacramentos y asistente IA.",
    icon: Globe,
  },
  {
    id: "horarios",
    label: "Horarios de Misas",
    url: `${SITE_URL}/#horarios`,
    description: "Lleva directo a las horas de Santa Misa y confesiones.",
    icon: Clock,
  },
  {
    id: "sacramentos",
    label: "Requisitos de Sacramentos",
    url: `${SITE_URL}/sacramentos`,
    description: "Para fieles que van al despacho por Bautismo o Matrimonio.",
    icon: BookOpen,
  },
  {
    id: "eventos",
    label: "Avisos y Eventos",
    url: `${SITE_URL}/#eventos`,
    description: "Para que revisen las actividades parroquiales de la semana.",
    icon: Calendar,
  },
];

export function ParishQrManager({ showToast }: { showToast?: (msg: string, type?: "success" | "error") => void }) {
  const [selectedDestination, setSelectedDestination] = useState(PRESET_DESTINATIONS[0]);
  const [customSubtitle, setCustomSubtitle] = useState("Escanea con la cámara de tu celular para ver horarios de misa, sacramentos y avisos");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Descarga en Alta Resolución (1200x1200px con antialiasing nítido y logo HD)
  const downloadHighResPng = () => {
    const hdCanvas = document.getElementById("parish-hd-canvas") as HTMLCanvasElement;
    if (!hdCanvas) {
      if (showToast) showToast("Generando imagen... intenta en un segundo", "error");
      return;
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1200;
    exportCanvas.height = 1200;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Fondo blanco puro
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 1200);

    // Renderizado suave y de máxima calidad
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(hdCanvas, 0, 0, 1200, 1200);

    const a = document.createElement("a");
    a.download = `QR-Parroquia-Santisima-Trinidad-${selectedDestination.id}-HD.png`;
    a.href = exportCanvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (showToast) showToast("Código QR descargado en alta definición (1200px)", "success");
  };

  // Descarga Vectorial SVG (Calidad infinita sin ningún tipo de píxel)
  const downloadVectorSvg = () => {
    const svgEl = document.getElementById("parish-vector-qr");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `QR-Parroquia-Santisima-Trinidad-${selectedDestination.id}-Vectorial.svg`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (showToast) showToast("Vector SVG descargado (calidad infinita para imprenta)", "success");
  };

  const handlePrint = () => {
    const posterEl = document.getElementById("parish-printable-poster");
    if (!posterEl) return;

    // Crear un iframe invisible para aislar la hoja e imprimir en EXACTAMENTE 1 PÁGINA A4/Carta
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Clonamos el contenido del cartel
    const htmlContent = posterEl.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Cartel Oficial - Parroquia Santísima Trinidad de Tingo</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0.6cm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 0;
              margin: 0;
            }
            .poster-card {
              width: 100%;
              max-width: 520px;
              margin: auto;
              border: 3.5px solid #d97706 !important;
              border-radius: 24px !important;
              padding: 24px 20px !important;
              text-align: center;
              background: #ffffff !important;
              display: flex;
              flex-direction: column;
              align-items: center;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .gold-bar {
              width: 60px;
              height: 4px;
              background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b) !important;
              border-radius: 9999px;
              margin-bottom: 12px;
            }
            .logo-wrap {
              width: 72px;
              height: 72px;
              border-radius: 9999px;
              border: 2px solid #f59e0b !important;
              padding: 2px;
              margin: 0 auto 10px auto;
              background: #ffffff !important;
              overflow: hidden;
            }
            .logo-wrap img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 9999px;
            }
            h1 {
              font-size: 19px;
              font-weight: 900;
              text-transform: uppercase;
              color: #0f172a;
              letter-spacing: -0.02em;
              line-height: 1.15;
            }
            .sub-arch {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #b45309;
              letter-spacing: 0.12em;
              margin-top: 3px;
            }
            .divider {
              width: 100%;
              border-top: 1px solid #e2e8f0;
              margin: 12px 0;
            }
            .invitation {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
              padding: 0 10px;
              line-height: 1.3;
            }
            .qr-box {
              margin: 14px 0;
              padding: 12px;
              background: #ffffff !important;
              border: 2px solid #cbd5e1 !important;
              border-radius: 18px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .qr-box svg {
              display: block;
              width: 230px !important;
              height: 230px !important;
            }
            .grid-features {
              width: 100%;
              background: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 14px;
              padding: 10px 14px;
              margin-bottom: 14px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 12px;
              text-align: left;
              font-size: 11px;
              color: #334155;
            }
            .grid-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 600;
            }
            .grid-item span {
              color: #d97706;
              font-size: 13px;
            }
            .footer-url {
              font-size: 13px;
              font-weight: 800;
              font-family: monospace;
              color: #0f172a;
              letter-spacing: -0.01em;
            }
            .footer-info {
              font-size: 9.5px;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Esperar a que se renderice el SVG y lanzar el diálogo de impresión
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 400);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(selectedDestination.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (showToast) showToast("Enlace copiado al portapapeles", "success");
  };

  return (
    <div className="space-y-8">
      {/* Canvas invisible en Ultra Alta Definición (1200x1200) para exportación PNG nítida */}
      <div
        style={{
          position: "absolute",
          left: "-99999px",
          top: "-99999px",
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden="true"
      >
        <QRCodeCanvas
          id="parish-hd-canvas"
          value={selectedDestination.url}
          size={1200}
          level="H"
          includeMargin={true}
          marginSize={3}
          imageSettings={{
            src: PARISH_HD_LOGO,
            height: 330,
            width: 330,
            excavate: true,
          }}
        />
      </div>

      {/* Estilos para impresión limpia del cartel oficial */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #parish-printable-poster, #parish-printable-poster * {
            visibility: visible !important;
          }
          #parish-printable-poster {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 2.5cm !important;
            background: white !important;
            color: #1a1a1a !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* CABECERA EXPLICATIVA */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
              <QrCode size={26} />
            </div>
            <div>
              <h2 className="font-display text-xl text-primary font-bold">Generador de Código QR Parroquial con Logo</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Genera códigos y carteles listos para imprimir en el templo con el escudo oficial totalmente nítido en alta resolución.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={downloadVectorSvg}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-border transition-colors"
              title="Descargar en formato vectorial sin pérdida de calidad"
            >
              <Sparkles size={14} className="text-amber-500" /> Vector SVG
            </button>
            <button
              onClick={downloadHighResPng}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-border transition-colors"
            >
              <Download size={15} /> Descargar PNG HD
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-all"
            >
              <Printer size={15} /> Imprimir Cartel A4
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <div className="lg:col-span-5 space-y-6">
          {/* SELECCIÓN DE DESTINO */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Globe size={15} className="text-gold" /> ¿A qué parte de la web apunta el QR?
            </h3>
            <p className="text-xs text-muted-foreground">
              Puedes elegir a qué sección llegará la persona cuando escanee el código con su celular:
            </p>

            <div className="space-y-2">
              {PRESET_DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                const isSelected = selectedDestination.id === dest.id;
                return (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDestination(dest)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "border-gold bg-gold/10 text-primary shadow-sm"
                        : "border-border hover:bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${isSelected ? "bg-gold text-primary font-bold" : "bg-secondary text-foreground"}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {dest.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {dest.description}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/80 mt-1 truncate">
                        {dest.url}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border text-xs">
              <span className="text-muted-foreground text-[11px]">Enlace del QR seleccionado:</span>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1 text-gold hover:underline font-medium text-[11px]"
              >
                {copied ? <Check size={12} className="text-green-600" /> : <ExternalLink size={12} />}
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>
          </div>

          {/* MENSAJE PERSONALIZADO DEL CARTEL */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
            <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider">
              Frase del Cartel
            </h3>
            <p className="text-xs text-muted-foreground">
              Esta es la invitación que leerán los fieles en el afiche:
            </p>
            <textarea
              value={customSubtitle}
              onChange={(e) => setCustomSubtitle(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-input bg-background focus:border-gold outline-none resize-none"
            />
          </div>

          {/* CONSEJOS CLAVE DE UBICACIÓN */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-xs space-y-2 text-amber-950 dark:text-amber-200">
            <p className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
              💡 Dónde colocar este código en la parroquia:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
              <li><strong>Puertas del Templo:</strong> El momento en que la gente más usa el celular es justo al terminar la misa.</li>
              <li><strong>Ventanilla de Secretaría:</strong> Para que consulten requisitos de bautizo sin esperar en fila.</li>
              <li><strong>Mural o vitrina de avisos parroquiales:</strong> Junto al afiche del evangelio dominical.</li>
              <li><strong>Al dorso de las bancas:</strong> En un sticker pequeño para que puedan leer las lecturas durante la misa.</li>
            </ul>
          </div>
        </div>

        {/* PANEL DERECHO: VISTA PREVIA DEL CARTEL OFICIAL */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 self-start">
            Vista Previa del Cartel (Vectorial · Máxima Nitidez)
          </p>

          {/* CONTENEDOR DEL CARTEL IMPRIMIBLE */}
          <div
            id="parish-printable-poster"
            ref={printRef}
            className="w-full max-w-[480px] bg-white text-slate-900 rounded-3xl p-8 border-4 border-amber-600/30 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Adorno superior dorado */}
            <div className="gold-bar w-16 h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 rounded-full mb-3" />

            {/* Logo de la Parroquia (Cabecera) */}
            <div className="logo-wrap w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500 p-0.5 shadow-md overflow-hidden bg-white mx-auto mb-2">
              <img
                src={PARISH_HD_LOGO}
                alt="Logo Parroquia Santísima Trinidad"
                className="w-full h-full object-cover rounded-full"
                loading="eager"
              />
            </div>

            {/* Título institucional */}
            <h1 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight uppercase">
              Parroquia Santísima Trinidad
            </h1>
            <p className="sub-arch text-[11px] tracking-widest uppercase font-bold text-amber-700 mt-0.5">
              Tingo · Arquidiócesis de Arequipa
            </p>

            <div className="divider w-full border-t border-slate-200 my-3" />

            {/* Llamado a la acción */}
            <p className="invitation text-xs sm:text-sm font-bold text-slate-800 px-3 leading-snug">
              {customSubtitle}
            </p>

            {/* CÓDIGO QR ENMARCADO VECTORIAL CON LOGO AL CENTRO EN ALTA DEFINICIÓN */}
            <div className="qr-box my-3.5 p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner inline-flex items-center justify-center">
              <QRCodeSVG
                id="parish-vector-qr"
                value={selectedDestination.url}
                size={230}
                level="H"
                includeMargin={true}
                marginSize={2}
                imageSettings={{
                  src: PARISH_HD_LOGO,
                  height: 64,
                  width: 64,
                  excavate: true,
                }}
              />
            </div>

            {/* VIÑETAS DE CONTENIDO DISPONIBLE */}
            <div className="grid-features w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 text-left grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="grid-item flex items-center gap-1.5 font-medium">
                <span className="text-amber-600 text-sm">⏰</span> Horarios de Misa
              </div>
              <div className="grid-item flex items-center gap-1.5 font-medium">
                <span className="text-amber-600 text-sm">🕊️</span> Sacramentos y Fechas
              </div>
              <div className="grid-item flex items-center gap-1.5 font-medium">
                <span className="text-amber-600 text-sm">📢</span> Avisos de la Semana
              </div>
              <div className="grid-item flex items-center gap-1.5 font-medium">
                <span className="text-amber-600 text-sm">🤖</span> Hermano Elías (IA)
              </div>
            </div>

            {/* ENLACE ESCRITO Y PIE DE PÁGINA */}
            <div className="text-center space-y-0.5">
              <p className="footer-url text-xs font-mono font-bold text-slate-900 tracking-tight">
                parroquiatrinidadtingo.vercel.app
              </p>
              <p className="footer-info text-[9.5px] text-slate-700 uppercase tracking-wider">
                Calle Ferrocarril 200 · Tingo · Tel. 915 049 850
              </p>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-primary font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Printer size={15} /> Imprimir Cartel A4
            </button>
            <button
              onClick={downloadHighResPng}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-border transition-colors"
            >
              <Download size={14} /> Guardar PNG HD
            </button>
            <button
              onClick={downloadVectorSvg}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-border transition-colors"
            >
              <Sparkles size={14} className="text-amber-500" /> Guardar Vector SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

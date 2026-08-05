import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Heart, Copy, Check, Smartphone, Landmark, Download, ShieldCheck } from "lucide-react";
import { getSupabaseImageUrl } from "@/lib/image-url";

export type DonationRow = { 
  id: string; title: string; bank_name: string; account_number: string | null; 
  cci: string | null; qr_image_url: string | null; description: string | null; 
};

export function DonacionesSection({ items }: { items: DonationRow[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (url: string, bankName: string) => {
    const a = document.createElement("a");
    a.href = getSupabaseImageUrl(url, { quality: 100 });
    a.download = `QR-Donacion-${bankName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (items.length === 0) return null;

  const bankColor: Record<string, string> = {
    Yape: "bg-purple-100 text-purple-800 border-purple-200",
    Plin: "bg-teal-100 text-teal-800 border-teal-200",
    BCP: "bg-orange-100 text-orange-800 border-orange-200",
    Interbank: "bg-emerald-100 text-emerald-800 border-emerald-200",
    BBVA: "bg-sky-100 text-sky-800 border-sky-200",
    Scotiabank: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <section id="donaciones" className="py-24 px-5 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-6 shadow-sm">
            <Heart size={32} fill="currentColor" className="animate-pulse duration-3000" />
          </div>
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Generosidad</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Colabora con tu parroquia</h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Tu apoyo nos ayuda al mantenimiento del templo, obras de caridad y la evangelización en nuestra comunidad.
          </p>
        </Reveal>

        {/* 🚀 AGREGADO 'justify-center' AQUÍ PARA CENTRAR LAS TARJETAS 🚀 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center justify-center">
          {items.map((item) => {
            const badgeStyle = bankColor[item.bank_name] || "bg-secondary text-primary border-border";

            return (
              <Reveal key={item.id} className="w-full max-w-sm h-full">
                <div className="h-full flex flex-col bg-card rounded-3xl border border-border shadow-card overflow-hidden hover:shadow-elegant transition-all">
                  
                  {/* Cabecera */}
                  <div className="p-6 pb-0 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
                      {item.bank_name}
                    </span>
                    {item.qr_image_url ? <Smartphone size={18} className="text-gold" /> : <Landmark size={18} className="text-gold" />}
                  </div>

                  <div className="p-6 flex-1 flex flex-col items-center text-center">
                    <h3 className="font-display text-2xl text-primary mb-1">{item.title}</h3>
                    
                    {/* Billeteras Digitales (Yape/Plin) con QR */}
                    {item.qr_image_url ? (
                      <div className="flex flex-col items-center mt-2 mb-2 w-full">
                        {item.account_number && (
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(item.account_number!, item.id + 'num')}
                            className="flex items-center justify-center gap-2 mb-4 p-2 rounded-xl hover:bg-secondary transition-colors w-full group bg-transparent border-0 cursor-pointer"
                          >
                            <p className="text-sm text-primary font-medium">Número: <span className="font-mono text-base">{item.account_number}</span></p>
                            {copiedId === item.id + 'num' 
                              ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase"><Check size={14}/> Copiado</span>
                              : <Copy size={14} className="text-muted-foreground group-hover:text-gold" />
                            }
                          </button>
                        )}
                        
                        <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white p-3 rounded-[2rem] border-2 border-secondary mb-5 flex items-center justify-center shadow-sm relative group">
                          <img 
                            src={getSupabaseImageUrl(item.qr_image_url, { width: 400, quality: 90 })} 
                            alt={`QR de ${item.bank_name}`} 
                            loading="lazy" 
                            className="w-full h-full object-contain" 
                          />
                        </div>

                        {/* Botón Guardar QR */}
                        <button
                          type="button"
                          onClick={() => downloadQR(item.qr_image_url!, item.bank_name)}
                          className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-primary rounded-full text-xs font-semibold transition-colors border border-border cursor-pointer"
                        >
                          <Download size={14} className="text-gold" /> Guardar QR
                        </button>
                      </div>
                    ) : (
                      /* Tarjeta de Cuenta Bancaria */
                      <div className="w-full flex-1 flex flex-col justify-center space-y-3 mt-4">
                        {item.account_number && (
                          <div className="bg-secondary/40 p-4 rounded-2xl border border-border transition-colors hover:border-gold/30 relative">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">Número de Cuenta</p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[13px] text-primary break-all font-medium text-left">{item.account_number}</span>
                              <button 
                                type="button"
                                onClick={() => copyToClipboard(item.account_number!, item.id + 'acc')} 
                                className="flex-shrink-0 p-2 text-muted-foreground hover:text-gold hover:bg-white rounded-lg transition-all bg-transparent border-0 cursor-pointer"
                                aria-label="Copiar cuenta"
                              >
                                {copiedId === item.id + 'acc' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                              </button>
                            </div>
                          </div>
                        )}
                        {item.cci && (
                          <div className="bg-secondary/40 p-4 rounded-2xl border border-border transition-colors hover:border-gold/30 relative">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">CCI (Interbancario)</p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[13px] text-primary break-all font-medium text-left">{item.cci}</span>
                              <button 
                                type="button"
                                onClick={() => copyToClipboard(item.cci!, item.id + 'cci')} 
                                className="flex-shrink-0 p-2 text-muted-foreground hover:text-gold hover:bg-white rounded-lg transition-all bg-transparent border-0 cursor-pointer"
                                aria-label="Copiar CCI"
                              >
                                {copiedId === item.id + 'cci' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {item.description && <p className="text-sm text-muted-foreground mt-4">{item.description}</p>}
                  </div>
                  
                  {/* Pie de la tarjeta */}
                  <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <ShieldCheck size={14} className="text-green-600" />
                    Verifica el titular al transferir
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}aa
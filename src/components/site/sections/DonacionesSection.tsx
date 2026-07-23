import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Heart, Copy, Check, Smartphone, Landmark } from "lucide-react";
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

  if (items.length === 0) return null;

  // Paleta de colores para los bancos
  const bankColor: Record<string, string> = {
    Yape: "bg-purple-100 text-purple-800",
    Plin: "bg-teal-100 text-teal-800",
    BCP: "bg-orange-100 text-orange-800",
    Interbank: "bg-emerald-100 text-emerald-800",
    BBVA: "bg-sky-100 text-sky-800",
    Scotiabank: "bg-red-100 text-red-800",
  };

  return (
    <section id="donaciones" className="py-24 px-5 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-6">
            <Heart size={32} fill="currentColor" />
          </div>
          <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">Generosidad</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium">Colabora con tu parroquia</h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Tu apoyo nos ayuda al mantenimiento del templo, obras de caridad y evangelización en nuestra Parroquia
          </p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-8">
          {items.map((item) => (
            <Reveal key={item.id} className="h-full w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm">
              <div className="h-full flex flex-col bg-card rounded-3xl border border-border shadow-card overflow-hidden hover:shadow-elegant transition-all">
                
                {/* Cabecera de la tarjeta */}
                <div className="p-6 pb-0 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bankColor[item.bank_name] || "bg-secondary text-primary"}`}>
                    {item.bank_name}
                  </span>
                  {item.qr_image_url ? <Smartphone size={18} className="text-gold" /> : <Landmark size={18} className="text-gold" />}
                </div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-display text-2xl text-primary mb-1">{item.title}</h3>
                  
                  {/* Mostrar el número de teléfono arriba del QR si es billetera digital */}
                  {(item.bank_name === "Yape" || item.bank_name === "Plin") && item.account_number && (
                    <div className="flex items-center gap-2 mb-4 group cursor-pointer" onClick={() => copyToClipboard(item.account_number!, item.id + 'num')}>
                      <p className="text-sm text-primary font-medium">Número: <span className="font-mono">{item.account_number}</span></p>
                      {copiedId === item.id + 'num' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground group-hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}

                  {item.description && <p className="text-sm text-muted-foreground mb-6">{item.description}</p>}

                  {/* Visualización del QR mejorada */}
                  {item.qr_image_url ? (
                    <div className="w-52 h-52 bg-white p-4 rounded-[2rem] border-2 border-secondary mb-4 flex items-center justify-center shadow-sm">
                      <img src={getSupabaseImageUrl(item.qr_image_url, { width: 400, quality: 90 })} alt="QR Donación" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    /* Tarjeta de Cuenta Bancaria */
                    <div className="w-full space-y-3 mt-2">
                      {item.account_number && (
                        <div className="bg-secondary/40 p-4 rounded-2xl border border-border group relative transition-colors hover:border-gold/30">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">Número de Cuenta</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[13px] text-primary break-all pr-8 font-medium">{item.account_number}</span>
                            <button onClick={() => copyToClipboard(item.account_number!, item.id + 'acc')} className="absolute right-3 p-2 text-muted-foreground hover:text-gold hover:bg-white rounded-lg transition-all" title="Copiar cuenta">
                              {copiedId === item.id + 'acc' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                      {item.cci && (
                        <div className="bg-secondary/40 p-4 rounded-2xl border border-border group relative transition-colors hover:border-gold/30">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">CCI (Interbancario)</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[13px] text-primary break-all pr-8 font-medium">{item.cci}</span>
                            <button onClick={() => copyToClipboard(item.cci!, item.id + 'cci')} className="absolute right-3 p-2 text-muted-foreground hover:text-gold hover:bg-white rounded-lg transition-all" title="Copiar CCI">
                              {copiedId === item.id + 'cci' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Pie de la tarjeta */}
                <div className="p-4 bg-secondary/30 border-t border-border text-center text-[11px] font-medium text-muted-foreground italic">
                  ¡Muchas gracias por apoyar!
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Heart, Copy, Check, Smartphone, Landmark } from "lucide-react";
import { toast } from "sonner"; // Asegúrate de tener sonner instalado

export type DonationRow = { 
  id: string; title: string; bank_name: string; account_number: string | null; 
  cci: string | null; qr_image_url: string | null; description: string | null; 
};

export function DonacionesSection({ items }: { items: DonationRow[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copiado al portapapeles"); 
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (items.length === 0) return null;

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
                
                <div className="p-6 pb-0 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bankColor[item.bank_name] || "bg-secondary text-primary"}`}>
                    {item.bank_name}
                  </span>
                  {item.qr_image_url ? <Smartphone size={18} className="text-gold" /> : <Landmark size={18} className="text-gold" />}
                </div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-display text-2xl text-primary mb-1">{item.title}</h3>
                  
                  {/* Billeteras Digitales */}
                  {/* Sección especial para Yape y Plin */}
                  {(item.bank_name === "Yape" || item.bank_name === "Plin") && item.account_number && (
                    <div 
                      onClick={() => copyToClipboard(item.account_number!.replace(/\s/g, ''), item.id + 'num')}
                      className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100 cursor-pointer hover:bg-purple-100 transition-all group"
                    >
                      <p className="text-sm text-purple-900 font-medium">
                        Número: <span className="font-mono font-bold tracking-wider">{item.account_number}</span>
                      </p>
                      
                      {/* Icono de copiar que cambia a check al hacer clic */}
                      {copiedId === item.id + 'num' 
                        ? <Check size={16} className="text-green-600" /> 
                        : <Copy size={16} className="text-purple-600 group-hover:text-purple-800" />
                      }
                    </div>
                  )}

                  {item.description && <p className="text-sm text-muted-foreground mb-6">{item.description}</p>}

                  {/* Visualización de QR o Cuentas Bancarias */}
                  {item.qr_image_url ? (
                    <div className="w-52 h-52 bg-white p-4 rounded-[2rem] border-2 border-secondary mb-4 flex items-center justify-center shadow-sm">
                      <img src={item.qr_image_url} alt="QR Donación" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full space-y-3 mt-2">
                      {/* Componente reutilizable para cuentas */}
                      {[ { label: "Cuenta", val: item.account_number, id: 'acc' }, { label: "CCI", val: item.cci, id: 'cci' } ].map((field) => (
                        field.val && (
                          <div 
                            key={field.id}
                            onClick={() => copyToClipboard(field.val!.replace(/\s/g, ''), item.id + field.id)}
                            className="bg-secondary/40 p-4 rounded-2xl border border-border group cursor-pointer transition-all hover:border-gold hover:bg-secondary/60 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{field.label}</p>
                                <span className="font-mono text-[13px] text-primary font-medium">{field.val}</span>
                              </div>
                              {copiedId === item.id + field.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-muted-foreground group-hover:text-gold" />}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
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
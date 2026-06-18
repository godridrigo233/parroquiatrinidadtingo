import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Heart, Copy, Check, Smartphone, Landmark } from "lucide-react";

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
                  <span className="px-3 py-1 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-wider">
                    {item.bank_name}
                  </span>
                  {item.qr_image_url ? <Smartphone size={20} className="text-gold" /> : <Landmark size={20} className="text-gold" />}
                </div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-display text-2xl text-primary mb-2">{item.title}</h3>
                  {item.description && <p className="text-sm text-muted-foreground mb-6">{item.description}</p>}

                  {item.qr_image_url ? (
                    <div className="w-48 h-48 bg-white p-2 rounded-2xl border-4 border-secondary mb-4 flex items-center justify-center">
                      <img src={item.qr_image_url} alt="QR Donación" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full space-y-3 mt-2">
                      {item.account_number && (
                        <div className="bg-secondary/50 p-4 rounded-2xl border border-border group relative">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">Número de Cuenta</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-primary break-all pr-8">{item.account_number}</span>
                            <button onClick={() => copyToClipboard(item.account_number!, item.id + 'acc')} className="absolute right-3 p-2 hover:text-gold">
                              {copiedId === item.id + 'acc' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                      {item.cci && (
                        <div className="bg-secondary/50 p-4 rounded-2xl border border-border group relative">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold text-left mb-1">CCI (Interbancario)</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-primary break-all pr-8">{item.cci}</span>
                            <button onClick={() => copyToClipboard(item.cci!, item.id + 'cci')} className="absolute right-3 p-2 hover:text-gold">
                              {copiedId === item.id + 'cci' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-secondary/30 text-center text-xs text-muted-foreground italic">
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
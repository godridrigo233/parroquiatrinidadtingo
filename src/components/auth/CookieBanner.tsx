import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificamos si el usuario ya aceptó antes
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) setIsVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    // Avisamos al sistema que ya puede cargar Analytics
    window.dispatchEvent(new Event('consent-accepted'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 p-5 bg-white border border-border rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de nuestra parroquia. Al continuar, aceptas nuestra política de privacidad.
      </p>
      <button 
        onClick={acceptCookies}
        className="shrink-0 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors shadow-sm"
      >
        Entendido
      </button>
    </div>
  );
}
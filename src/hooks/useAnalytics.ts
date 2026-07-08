import { useEffect } from 'react';

export const useAnalytics = (measurementId: string) => {
  useEffect(() => {
    const initAnalytics = () => {
      // Evitamos inyectarlo dos veces
      if (document.getElementById('ga-script')) return;

      const script1 = document.createElement('script');
      script1.id = 'ga-script';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga-config';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `;
      document.head.appendChild(script2);
    };

    // Si ya aceptó antes, lo cargamos directo
    if (localStorage.getItem('cookieConsent') === 'true') {
      initAnalytics();
    } else {
      // Si no, esperamos a que le dé clic al botón "Entendido"
      window.addEventListener('consent-accepted', initAnalytics);
    }

    return () => window.removeEventListener('consent-accepted', initAnalytics);
  }, [measurementId]);
};
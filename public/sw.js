// Este es un Service Worker "Dummy" (básico).
// Su única función es existir para que Chrome habilite el botón de Instalar PWA.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // No hacemos nada con las peticiones, dejamos que Vercel se encargue.
});
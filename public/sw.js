// Desactivamos cualquier lógica de caché
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Este evento es el que bloqueaba tus imágenes. 
// Ahora lo dejamos vacío para que el navegador ignore el SW al cargar archivos.
self.addEventListener('fetch', (e) => {
  return; 
});
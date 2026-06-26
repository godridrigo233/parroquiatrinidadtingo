// public/sw.js
// 🚨 Cambiamos la versión a v2 para forzar a los celulares y PCs a borrar la basura vieja
const CACHE_NAME = 'parroquia-cache-v2';

// 1. Instalar y obligar al navegador a usar esta nueva versión de inmediato
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Al activarse, DESTRUIR la caché vieja que está congelando las pestañas nuevas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Elimina cualquier rastro de la versión v1 o cachés rebeldes
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la página en el acto
  );
});

// 3. El truco maestro: El evento fantasma
self.addEventListener('fetch', (event) => {
  // Chrome en Android EXIGE que este evento 'fetch' exista en el código 
  // para permitir que salga el botón de "Instalar App".
  // Al no interceptar nada adentro, engañamos a Chrome: cumplimos su regla, 
  // pero obligamos al navegador a pedirle los datos frescos a Vercel SIEMPRE.
  return;
});
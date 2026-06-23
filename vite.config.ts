import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola cuando haces cambios
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/logo.png'],
      manifest: {
        name: 'Parroquia Santísima Trinidad',
        short_name: 'P. Trinidad',
        description: 'Parroquia Santísima Trinidad de Tingo, Arequipa',
        theme_color: '#f5f3ef', // El color principal de tu página (fondo)
        background_color: '#f5f3ef',
        display: 'standalone', // Esto oculta la barra del navegador de Chrome/Safari
        icons: [
          {
            src: 'pwa-192x192.png', // Tendrás que crear estas imágenes
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
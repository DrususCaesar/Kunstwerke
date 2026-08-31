import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Kunstwerke',
        short_name: 'Kunstwerke',
        description: 'Private Katalogisierungs-App für selbst fotografierte Kunstwerke aus Museumsbesuchen.',
        lang: 'de',
        start_url: '/',
        display: 'standalone',
        background_color: '#211f1a',
        theme_color: '#211f1a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App-Shell offline verfügbar machen — echter Sync folgt über
        // src/services/offlineSync.ts (Konzept Abschnitt 4.1, 7).
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/DOX/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/DOX/',
        name: 'DOX',
        short_name: 'DOX',
        description: 'DOX prehospital support app',
        start_url: '/DOX/',
        scope: '/DOX/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0b3d2e',
        icons: [
          {
            src: '/DOX/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/DOX/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/DOX/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,pdf}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})

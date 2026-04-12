import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // ngrok (and similar tunnels) use a random hostname each session unless reserved
    allowedHosts: true,
    // Same-origin API in dev: Telegram/ngrok hits this host; we forward to the local Nest API.
    // Prefix avoids clashing with SPA routes like /orders.
    proxy: {
      '/_parfumbox-api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_parfumbox-api/, '') || '/',
      },
    },
  },
})

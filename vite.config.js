import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev, /api calls go to the Express server so we don't need CORS or VITE_API_URL.
    proxy: {
      '/api': 'http://localhost:3100',
    },
  },
})

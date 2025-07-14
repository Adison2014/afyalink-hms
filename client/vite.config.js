import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect production (Render sets NODE_ENV=production)
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5005,
    proxy: isProduction
      ? {} // No proxy in production
      : {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
        },
  },
  build: {
    rollupOptions: {
      output: {
        // Avoid warnings about mixed modules if any
        manualChunks: undefined,
      },
    },
  },
})

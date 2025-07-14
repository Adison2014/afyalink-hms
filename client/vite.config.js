import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set API base URL depending on dev or production
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5005,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __API_BASE_URL__: JSON.stringify(
      isDev
        ? 'http://localhost:5000/api'
        : 'https://afyalink-hms-backend.onrender.com/api'
    ),
  },
})

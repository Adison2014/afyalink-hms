import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5005,
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:5000',
      },
    },
  }
})

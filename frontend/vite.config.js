import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || (mode === 'production' || mode === 'online' ? 'https://ergosoul.in/api' : 'http://localhost:5000/api')
  const backendOrigin = apiUrl.replace(/\/api\/?$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/blog': 'http://localhost:5000',
      '/dashboard': 'http://localhost:5000',
      '/comment': 'http://localhost:5000',
      '/users': 'http://localhost:5000',
      '/feed': 'http://localhost:5000'
    }
  }
})

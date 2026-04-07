import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Thay đổi dòng này

// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Hướng mọi request /api sang đây
        changeOrigin: true,
      },
    },
  },
})
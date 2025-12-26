import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://equal-sign-backend-api-haejb5bdhnezc2c2.koreacentral-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

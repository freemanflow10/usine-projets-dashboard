import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 4176,
    strictPort: true,
    allowedHosts: ['.local', 'localhost'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4177,
    strictPort: true,
    allowedHosts: ['.local', 'localhost'],
  },
})
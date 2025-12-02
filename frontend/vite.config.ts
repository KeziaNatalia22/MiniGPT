import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,

    allowedHosts: [
      "ec2-98-92-175-45.compute-1.amazonaws.com",
      "98.92.175.45"
    ],

    proxy: {
      "/api": {
        // read from env (Vite exposes VITE_* vars to the client) so it's easy
        // to switch between local and remote backend. Fallback to localhost.
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

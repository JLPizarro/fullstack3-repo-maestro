import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] },
    port: 3000, hmr: { clientPort: 8080 },
    host: true
  },
  base: '/operacion/'
})

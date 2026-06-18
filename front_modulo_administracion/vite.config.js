import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] },
    host: true,
    port: 3007, hmr: { clientPort: 8080 }
  }
})

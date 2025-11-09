import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true,
    strictPort: false, // Will try next port if 5173 is busy
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})
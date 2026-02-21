import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    dedupe: ['three']
  },
  server: {
    host: true, // This exposes the server on the local network (e.g. 192.168.x.x)
  }
})

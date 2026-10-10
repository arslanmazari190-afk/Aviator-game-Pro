import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://aviator-game-pro.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://aviator-game-pro.onrender.com',
        ws: true,
      },
      '/uploads': {
        target: 'https://aviator-game-pro.onrender.com',
        changeOrigin: true,
      }
    }
  }
});

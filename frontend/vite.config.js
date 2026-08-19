import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api → Express backend on :5000.
// Build output (dist/) can be served statically; the API URL can also be set
// with VITE_API_BASE (see README → deployment).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: { outDir: 'dist' },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the local Azure Functions host (`func start`).
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
});

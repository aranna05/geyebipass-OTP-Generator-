import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Export Vite configuration object
export default defineConfig({
  // Register React plugin for Vite JSX transformation
  plugins: [react()],
  // Configure development server options
  server: {
    // Set default Vite frontend dev server port to 5173
    port: 5173,
    // Proxy /api requests to backend Express server running on port 5000
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});

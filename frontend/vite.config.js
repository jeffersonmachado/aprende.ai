import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const appBasePath = process.env.VITE_APP_BASE_PATH || '/';
const apiBase =
  process.env.VITE_API_BASE_URL ||
  process.env.VITE_API_BASE ||
  'http://localhost:3015';

export default defineConfig({
  base: appBasePath,
  plugins: [react()],
  server: { port: 5176, strictPort: true },
  define: { __API_BASE__: JSON.stringify(apiBase) },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router-dom') || id.includes('/react-router/')) return 'router';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('@testing-library')) return 'testing';
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});

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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
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

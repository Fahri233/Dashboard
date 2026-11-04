import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tursoApiDevPlugin } from './src/lib/dev-server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tursoApiDevPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});

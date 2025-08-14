import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime (React 17+)
      jsxRuntime: 'automatic',
      // Enable fast refresh
      fastRefresh: true,
    })
  ],
  root: 'frontend',
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'socket.io-client'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
      '@frontend': path.resolve(__dirname, './frontend'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    hmr: {
      port: 24677, // Different HMR port from standalone
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Configure how files are served
  assetsInclude: ['**/*.jsx', '**/*.js'],
  // Enable proper JSX handling with esbuild
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'jsx',
    include: /.*\.[jt]sx?$/,
    exclude: [],
  },
});

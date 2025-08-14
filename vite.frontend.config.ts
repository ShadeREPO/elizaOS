import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite config specifically for standalone frontend development
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
    outDir: '../dist/standalone',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/standalone.html'),
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
    port: 5174, // Different port from the main ElizaOS frontend
    host: true, // Allow external connections
    open: true, // Auto-open browser
    hmr: {
      port: 24678, // Use a different port for HMR to avoid conflicts
    },
    proxy: {
      // Proxy WebSocket connections to the agent backend
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
      // Proxy API calls to the agent backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Define development environment variables
    __STANDALONE_MODE__: true,
  },
  // Enable proper JSX handling with esbuild
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'jsx',
    include: /.*\.[jt]sx?$/,
    exclude: [],
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime (React 17+)
      jsxRuntime: 'automatic',
      // Enable fast refresh
      fastRefresh: true,
      // Include .jsx and .tsx files
      include: /\.(jsx|tsx)$/,
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    port: 5174,
    hmr: {
      port: 24678,
    },
  },
  // Ensure proper JSX handling
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})

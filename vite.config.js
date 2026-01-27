import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
    optimizeDeps: {
      include: ['react-signature-canvas'],
    },
  server: {
    proxy: {
      '/api': {
        target: 'https://genbeta-backend.onrender.com',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        headers: {
          'origin': 'https://genbeta-backend.onrender.com'
        }
      },
      '/uploads': {
        target: 'https://genbeta-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      protocol: 'ws',
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Increase limit to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-lib': ['lucide-react', 'framer-motion'],
          'charts': ['recharts'],
        },
        // Additional optimization
        compact: true,
      }
    }
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rewrite-controller-route',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/controller' || req.url === '/controller/') {
            req.url = '/controller.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        controller: resolve(__dirname, 'controller.html')
      }
    }
  }
})

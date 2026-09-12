import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-controller-as-index',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const urlPath = req.url.split('?')[0];
          if (urlPath === '/' || urlPath === '/index.html' || urlPath === '/controller') {
            try {
              const htmlPath = path.resolve(__dirname, 'controller.html');
              let html = fs.readFileSync(htmlPath, 'utf-8');
              html = await server.transformIndexHtml(req.url, html);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
              return;
            } catch (err) {
              return next(err);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3001,
    host: '0.0.0.0'
  }
})

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

const root = process.cwd();

// Entradas de las páginas (MPA). Las claves determinan el nombre del HTML de salida.
const pages = {
  'index': resolve(root, 'index.html'),
  'acerca-de': resolve(root, 'acerca-de.html'),
  'contacto': resolve(root, 'contacto.html'),
  '404': resolve(root, '404.html'),
};

export default defineConfig({
  build: {
    rollupOptions: {
      input: pages,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    // En desarrollo, permitir URLs limpias (/acerca-de, /contacto) mapeando a su HTML
    plugins: [
      {
        name: 'mpa-clean-urls',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const pathname = decodeURIComponent(req.url.split('?')[0]);
            if (pathname !== '/' && !pathname.includes('.')) {
              const htmlPath = resolve(root, `${pathname}.html`);
              if (existsSync(htmlPath)) {
                req.url = `${pathname}.html${req.url.slice(pathname.length)}`;
              }
            }
            next();
          });
        },
      },
    ],
  },
});
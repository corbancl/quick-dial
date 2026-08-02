import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const BUILD_QUERY = `?v=${pkg.version}`;

export default defineConfig({
  base: './',
  define: {
    __VERSION__: JSON.stringify('v' + pkg.version)
  },
  plugins: [
    svelte(),
    {
      name: 'copy-background',
      closeBundle() {
        copyFileSync('public/background.js', 'dist/background.js');
        copyFileSync('public/analytics.js', 'dist/analytics.js');
      }
    },
    {
      name: 'cache-bust',
      closeBundle() {
        const htmlPath = 'dist/index.html';
        let html = readFileSync(htmlPath, 'utf-8');
        html = html
          .replace(/(href="\.\/assets\/[^"]+)(")/g, `$1${BUILD_QUERY}$2`)
          .replace(/(src="\.\/assets\/[^"]+)(")/g, `$1${BUILD_QUERY}$2`);
        writeFileSync(htmlPath, html);
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});

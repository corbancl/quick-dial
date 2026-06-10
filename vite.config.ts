import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync, readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: './',
  define: {
    __VERSION__: JSON.stringify('v' + pkg.version)
  },
  server: {
    proxy: {
      '/api/ai-proxy': 'http://localhost:7788'
    }
  },
  plugins: [
    svelte(),
    {
      name: 'copy-background',
      closeBundle() {
        copyFileSync('public/background.js', 'dist/background.js');
        copyFileSync('public/analytics.js', 'dist/analytics.js');
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

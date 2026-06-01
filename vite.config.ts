import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync } from 'fs';

export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    {
      name: 'copy-background',
      closeBundle() {
        copyFileSync('public/background.js', 'dist/background.js');
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

import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'src/runtime-dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/runtime/entry.ts'),
      name: 'EjssRuntime',
      formats: ['iife'],
      fileName: () => 'ejss-runtime.js',
    },
    minify: true,
  },
});

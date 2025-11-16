import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OverlayManagerVue',
      formats: ['es', 'cjs'],
      fileName: format => {
        const ext = format === 'es' ? 'mjs' : 'js';
        return `index.${ext}`;
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        inlineDynamicImports: true,
      },
    },
  },
});

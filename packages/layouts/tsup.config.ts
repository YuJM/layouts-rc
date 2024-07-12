import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig((options) => ({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  clean: true,
  external: ['react'],
  esbuildPlugins: [sassPlugin()],
  ...options,
}));

import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig((options) => ({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  external: ['react'],
  esbuildPlugins: [sassPlugin()],
  ...options,
}));

import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  external: ['react'],
  ...options,
}));

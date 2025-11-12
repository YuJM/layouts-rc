import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  external: ['react'],
  minify: !options.watch, // Minify in production builds, keep readable in watch mode
  ...options,
}));

import esbuild from 'esbuild';
import alias from 'esbuild-plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  plugins: [
    alias({
      '@shared': path.resolve(__dirname, 'shared'),
    }),
  ],
});

console.log('✅ Build complete!');

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resolveSrc = (file) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

// Production builds resolve the `dev-fixture` specifier to an empty stub, so the
// sample data is never in the deployed bundle. Verify with:
//   npm run build && grep -c POV_TIMELINE_DEV_FIXTURE dist/assets/*.js   # expect 0
// Keep that guarantee intact if the fixture is ever pointed at real data again.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      'dev-fixture': mode === 'production'
        ? resolveSrc('devMock.stub.js')
        : resolveSrc('devMock.js'),
    },
  },
  server: { port: 5273, strictPort: true },
  build: { outDir: 'dist' },
}));

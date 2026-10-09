import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

// These mirror the values in src/styles/tokens.css (a manifest cannot read CSS
// variables). Keep them in sync when tokens change.
const MANIFEST_THEME_COLOR = '#6b5b7a';
const MANIFEST_BACKGROUND_COLOR = '#ffffff';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-maskable.svg'],
      manifest: {
        name: 'Cadence',
        short_name: 'Cadence',
        description: 'A private period and cycle tracker. All data stays on your device.',
        start_url: '/',
        display: 'standalone',
        background_color: MANIFEST_BACKGROUND_COLOR,
        theme_color: MANIFEST_THEME_COLOR,
        icons: [
          // TODO(spec): the manifest should also list 192x192 and 512x512 PNG
          // icons (binary assets, not producible in this text-only repo). The
          // discreet SVG icons below satisfy installability in current browsers.
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
});

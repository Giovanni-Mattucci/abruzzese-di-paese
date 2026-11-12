import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Adds the Cloudflare Web Analytics beacon to index.html when VITE_CF_ANALYTICS_TOKEN is set
 * (ADR 0016). No token means no beacon, so local builds, CI and forks ship without analytics.
 * Prerendering copies the built index.html, so every page gets the tag.
 */
function cloudflareAnalytics(): Plugin {
  let token = '';
  return {
    name: 'adp:cloudflare-analytics',
    apply: 'build',
    configResolved(config) {
      // config.env holds VITE_* values from both .env files and the process environment.
      token = String(config.env['VITE_CF_ANALYTICS_TOKEN'] ?? '').trim();
      // The token is public, but it lands in an HTML attribute, so accept only its known shape.
      if (token && !/^[a-f0-9]{32}$/i.test(token)) {
        throw new Error('VITE_CF_ANALYTICS_TOKEN must be a 32-character hex token');
      }
    },
    transformIndexHtml() {
      if (!token) return [];
      return [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://static.cloudflareinsights.com/beacon.min.js',
            'data-cf-beacon': JSON.stringify({ token }),
          },
          injectTo: 'body',
        },
      ];
    },
  };
}

// VITE_BASE_PATH is "/<repo>/" for a GitHub project site and "/" for a user site or custom domain.
export default defineConfig({
  base: process.env['VITE_BASE_PATH'] ?? '/',
  plugins: [react(), tailwindcss(), cloudflareAnalytics()],
  build: {
    sourcemap: true,
  },
});

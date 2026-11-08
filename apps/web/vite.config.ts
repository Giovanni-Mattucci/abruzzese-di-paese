import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// VITE_BASE_PATH is "/<repo>/" for a GitHub project site and "/" for a user site or custom domain.
export default defineConfig({
  base: process.env['VITE_BASE_PATH'] ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
  },
});

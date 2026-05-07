import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        manifest: {
          name: 'Shadow Sovereign',
          short_name: 'ShadowSovereign',
          description: 'نظام ارتقاء العاهل - تتبع العادات والمهمات',
          theme_color: '#3b82f6',
          background_color: '#0A0A0C',
          display: 'standalone',
          icons: [
            {
              src: 'https://img.icons8.com/ios-filled/192/3b82f6/ghost.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://img.icons8.com/ios-filled/512/3b82f6/ghost.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_VAPID_PUBLIC_KEY': JSON.stringify(env.VITE_VAPID_PUBLIC_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0', // Exposes the server to the local network
      port: 5173,
      strictPort: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

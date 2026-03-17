import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(() => {
  const env = loadEnv('', process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET;

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 80,
      allowedHosts: true,
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/uploads': {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});

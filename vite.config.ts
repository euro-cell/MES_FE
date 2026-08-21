import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(() => {
  const env = loadEnv('', process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET;
  const apiRewrite = env.VITE_API_REWRITE === 'true';

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['pdfjs-dist/build/pdf.worker.min.mjs'],
    },
    preview: {
      host: '0.0.0.0',
      port: 80,
      allowedHosts: true,
    },
    server: {
      host: '0.0.0.0',
      port: 80,
      allowedHosts: true,
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
              ...(apiRewrite && { rewrite: (path: string) => path.replace(/^\/api/, '') }),
              configure: proxy => {
                proxy.on('proxyReq', (proxyReq, req) => {
                  const clientIp = req.socket.remoteAddress?.replace('::ffff:', '') ?? '';
                  proxyReq.setHeader('X-Forwarded-For', clientIp);
                });
              },
            },
            // IQC Proto3: Univer CLI daemon 뷰어 릴레이용 경로 (로컬 dev 서버 전용 프록시)
            '/univer-viewer': {
              target: apiTarget,
              changeOrigin: true,
              ws: true,
            },
            // daemon 뷰어 JS가 /uf, /assets를 절대경로로 직접 호출해서 별도 프록시 필요
            '/uf': {
              target: apiTarget,
              changeOrigin: true,
              ws: true,
            },
            '/assets': {
              target: apiTarget,
              changeOrigin: true,
              ws: true,
            },
          }
        : undefined,
    },
  };
});

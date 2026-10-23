import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Vercel 배포 시 base 경로는 '/' (기본값)
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    // 큰 청크 분할 (로딩 속도 개선)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          xlsx: ['xlsx'],
          pdflib: ['pdf-lib'],
        }
      }
    }
  }
});

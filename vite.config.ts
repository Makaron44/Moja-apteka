
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' musi odpowiadać nazwie Twojego repozytorium na GitHubie
  base: '/Moja-apteka/',
  define: {
    'process.env': {}
  }
});

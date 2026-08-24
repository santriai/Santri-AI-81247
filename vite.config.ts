import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.GITHUB_TOKEN': JSON.stringify(env.VITE_GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN),
        'process.env.GITHUB_OWNER': JSON.stringify(env.VITE_GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || process.env.GITHUB_OWNER),
        'process.env.GITHUB_REPO': JSON.stringify(env.VITE_GITHUB_REPO || process.env.VITE_GITHUB_REPO || process.env.GITHUB_REPO),
        'process.env.GITHUB_BRANCH': JSON.stringify(env.VITE_GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || process.env.GITHUB_BRANCH)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

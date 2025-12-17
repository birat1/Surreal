import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const AUTH_TARGET = process.env.VITE_AUTH_TARGET || 'http://localhost:8002';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/auth': {
                target: AUTH_TARGET,
                changeOrigin: true,
                secure: false,
                rewrite: (p) => p.replace(/^\/auth/, ''),
            },
        },
    },
});

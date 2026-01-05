import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/AI-Based-Music-Generator-ReactJS/', // Matches homepage in package.json
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'build', // CRA outputs to build, keeping it consistent
    }
});

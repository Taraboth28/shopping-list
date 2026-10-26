import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

/*
 * Static build for Netlify: the app keeps all data in localStorage, so it needs no PHP.
 * Uses index.html instead of the Blade view and writes a plain SPA to dist/.
 */
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        {
            // public/ also holds Laravel's index.php, so copy only the static files we want.
            name: 'copy-static-public-files',
            closeBundle() {
                for (const file of ['favicon.ico', 'robots.txt']) {
                    copyFileSync(`public/${file}`, `dist/${file}`);
                }
            },
        },
    ],
    publicDir: false,
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});

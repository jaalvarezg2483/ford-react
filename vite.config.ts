import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoDir = path.dirname(fileURLToPath(import.meta.url))

// `public/` lo sirve el servidor integrado (cms/server.mjs) directamente; no se copia a dist/.
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: { alias: { '@': path.join(repoDir, 'src') } },
  build: { copyPublicDir: false },
  css: {
    preprocessorOptions: {
      scss: {
        // El SCSS original usa @import y funciones globales de Sass; se mantiene tal cual.
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls', 'slash-div', 'legacy-js-api'],
        quietDeps: true,
      },
    },
  },
  server: { watch: { ignored: ['**/cms/**', '**/public/**'] } },
})

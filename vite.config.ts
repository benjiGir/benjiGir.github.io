import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { sceneEditorPlugin } from './vite-plugin-scene-editor.ts'

export default defineConfig({
  plugins: [react(), sceneEditorPlugin()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  // Si tu déploies sur un sous-chemin (ex. github.io/portfolio), passe la base en variable :
  // VITE_BASE_PATH=/portfolio/ npm run build
  base: process.env.VITE_BASE_PATH ?? '/',
})

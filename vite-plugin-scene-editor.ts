import type { Plugin } from 'vite'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Plugin DEV ONLY de l'éditeur de scène.
//
// Expose `POST /__scene_editor/save` : reçoit le buffer d'overrides (JSON) et l'écrit dans
// src/scene/scene-overrides.json. Inactif en build (`apply: 'serve'`), donc aucun endpoint
// d'écriture ne part en production — seul le JSON committé y est lu.
//
// `handleHotUpdate` neutralise le reload HMR déclenché par notre propre écriture du JSON :
// les valeurs sont déjà appliquées en live dans la scène, un reload ne ferait que perdre l'état
// de l'éditeur (sélection, position freecam). Le disque sera relu au prochain reload manuel.
export function sceneEditorPlugin(): Plugin {
  let outFile = ''

  return {
    name: 'scene-editor-save',
    apply: 'serve',

    configResolved(config) {
      outFile = resolve(config.root, 'src/scene/scene-overrides.json')
    },

    configureServer(server) {
      server.middlewares.use('/__scene_editor/save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            // Re-parse pour valider + re-formater proprement avant écriture
            const parsed = JSON.parse(body)
            await writeFile(outFile, JSON.stringify(parsed, null, 2) + '\n', 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },

    handleHotUpdate(ctx) {
      if (ctx.file === outFile) return []
    },
  }
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { generateInspirationsManifest } from './scripts/generate-inspirations-manifest.mjs'

function inspirationsManifestPlugin() {
  let projectRoot = process.cwd()
  let isGenerating = false

  async function generate() {
    if (isGenerating) return
    isGenerating = true
    try {
      const { manifest } = await generateInspirationsManifest(projectRoot, { logSkipped: true })
      console.info(`[inspirations] Manifest ready with ${manifest.count} inspirations.`)
      return true
    } catch (error) {
      console.error('[inspirations] Manifest generation failed.', error)
      return false
    } finally {
      isGenerating = false
    }
  }

  return {
    name: 'devpilot-inspirations-manifest',
    async configResolved(config) {
      projectRoot = config.root
    },
    async buildStart() {
      const generated = await generate()
      if (!generated) {
        throw new Error('Failed to generate inspirations manifest.')
      }
    },
    configureServer(server) {
      const inspirationsRoot = path.resolve(projectRoot, 'public', 'inspirations')
      const manifestPath = path.join(inspirationsRoot, 'manifest.json')
      const generatedMetadataPath = path.join(inspirationsRoot, 'generated-metadata.json')

      server.watcher.add(inspirationsRoot)
      server.watcher.on('all', async (eventName, changedPath) => {
        if (!changedPath) return
        const normalizedPath = path.resolve(changedPath)
        if (!normalizedPath.startsWith(inspirationsRoot)) return
        if (normalizedPath === manifestPath) return
        if (normalizedPath === generatedMetadataPath) return
        if (!['add', 'addDir', 'unlink', 'unlinkDir', 'change'].includes(eventName)) return

        const generated = await generate()
        if (generated) {
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [inspirationsManifestPlugin(), react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})

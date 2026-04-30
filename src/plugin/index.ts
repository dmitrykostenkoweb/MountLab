import path from 'node:path'
import fg from 'fast-glob'
import type { Plugin, ViteDevServer } from 'vite'
import type { MountLabConfig } from '../core/types.js'

const VIRTUAL_CASES = 'virtual:mountlab/cases'
const VIRTUAL_CONFIG = 'virtual:mountlab/config'
const VIRTUAL_ENTRY = '/__mountlab/entry.js'

const RESOLVED_CASES = '\0mountlab:cases'
const RESOLVED_CONFIG = '\0mountlab:config'
const RESOLVED_ENTRY = '\0mountlab:entry'

async function resolveCasePaths(patterns: string[], root: string): Promise<string[]> {
  const globs = patterns.length > 0 ? patterns : ['src/**/*.case.ts']
  const files = await fg(globs, { cwd: root, absolute: true })
  return files
}

function generateCasesModule(casePaths: string[]): string {
  const imports = casePaths
    .map((p, i) => `import case${i} from ${JSON.stringify(p)}`)
    .join('\n')
  const exports = casePaths.map((_, i) => `case${i}`).join(', ')
  return `${imports}\nexport const cases = [${exports}]\n`
}

function generateEntryModule(configPath: string): string {
  // Use forward slashes on all platforms (Vite requirement)
  const normalizedConfig = configPath.replace(/\\/g, '/')
  return [
    `import { createApp } from 'vue'`,
    `import WorkbenchApp from '@mountlab/vue/runtime'`,
    `import { cases } from 'virtual:mountlab/cases'`,
    `import userConfig from ${JSON.stringify(normalizedConfig)}`,
    ``,
    `const app = createApp(WorkbenchApp)`,
    `app.provide('mountlab:cases', cases)`,
    `app.provide('mountlab:config', userConfig)`,
    `if (userConfig.setupApp) await userConfig.setupApp(app)`,
    `app.mount('#mountlab')`,
  ].join('\n')
}

function getHtmlShell(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MountLab</title>
  <style>html,body{margin:0;padding:0;height:100%;}</style>
</head>
<body>
  <div id="mountlab"></div>
  <script type="module" src="/__mountlab/entry.js"></script>
</body>
</html>`
}

export function mountlab(config: MountLabConfig = {}): Plugin {
  let root = process.cwd()
  let configPath = path.join(root, 'mountlab.config.ts')
  let casePaths: string[] = []

  return {
    name: 'mountlab',

    configResolved(resolved) {
      root = resolved.root
      configPath = path.join(root, 'mountlab.config.ts')
    },

    configureServer(server: ViteDevServer) {
      // Serve workbench HTML at root
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(getHtmlShell())
          return
        }
        next()
      })

      // Watch for case file changes and trigger full reload
      const patterns = config.cases ?? ['src/**/*.case.ts']
      const absPatterns = patterns.map(p =>
        path.isAbsolute(p) ? p : path.join(root, p),
      )

      server.watcher.add(absPatterns)

      async function invalidateCases() {
        const mod = server.moduleGraph.getModuleById(RESOLVED_CASES)
        if (mod) server.moduleGraph.invalidateModule(mod)
        casePaths = await resolveCasePaths(config.cases ?? [], root)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', (file) => {
        if (file.endsWith('.case.ts')) invalidateCases()
      })

      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.case.ts')) invalidateCases()
      })
    },

    resolveId(id) {
      if (id === VIRTUAL_CASES) return RESOLVED_CASES
      if (id === VIRTUAL_CONFIG) return RESOLVED_CONFIG
      if (id === VIRTUAL_ENTRY) return RESOLVED_ENTRY
    },

    async load(id) {
      if (id === RESOLVED_CASES) {
        casePaths = await resolveCasePaths(config.cases ?? [], root)
        return generateCasesModule(casePaths)
      }
      if (id === RESOLVED_CONFIG) {
        return `export const config = ${JSON.stringify({ port: config.port ?? 4300 })}`
      }
      if (id === RESOLVED_ENTRY) {
        return generateEntryModule(configPath)
      }
    },
  }
}

export type { MountLabConfig }

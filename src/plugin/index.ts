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
  return files.sort((a, b) => a.localeCompare(b))
}

function formatModulePath(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

function formatDiagnosticPath(filePath: string, root: string): string {
  const relative = path.relative(root, filePath)
  const displayPath = relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative
    : filePath
  return formatModulePath(displayPath)
}

function generateCasesModule(casePaths: string[], root: string): string {
  const imports = casePaths
    .map((p, i) => `import case${i} from ${JSON.stringify(formatModulePath(p))}`)
    .join('\n')
  const entries = casePaths
    .map((p, i) => `  { value: case${i}, path: ${JSON.stringify(formatDiagnosticPath(p, root))} }`)
    .join(',\n')

  return `${imports}

const caseEntries = [
${entries}
]

function formatInvalidCaseMessage(path, problems) {
  return [
    '[MountLab] Invalid component case in ' + path,
    '',
    'Expected default export created with defineComponentCase:',
    '- id: non-empty string',
    '- component: Vue component',
    '- variants: array',
    '',
    'Problems:',
    ...problems.map(problem => '- ' + problem),
  ].join('\\n')
}

function validateCaseEntry(entry) {
  const candidate = entry.value
  const problems = []

  if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error(formatInvalidCaseMessage(entry.path, ['default export must be an object']))
  }

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    problems.push('id must be a non-empty string')
  }

  if (!('component' in candidate) || candidate.component == null) {
    problems.push('component is required')
  }

  if (!Array.isArray(candidate.variants)) {
    problems.push('variants must be an array')
  }

  if (problems.length > 0) {
    throw new Error(formatInvalidCaseMessage(entry.path, problems))
  }

  return candidate
}

function assertUniqueCaseIds(cases) {
  const pathsById = new Map()

  for (const item of cases) {
    const paths = pathsById.get(item.case.id) ?? []
    paths.push(item.path)
    pathsById.set(item.case.id, paths)
  }

  const duplicates = Array.from(pathsById.entries()).filter(([, paths]) => paths.length > 1)
  if (duplicates.length === 0) return

  const details = duplicates.flatMap(([id, paths]) => [
    'Duplicate case id "' + id + '"',
    '',
    'Found in:',
    ...paths.map(path => '- ' + path),
  ])

  throw new Error(['[MountLab] Duplicate component case IDs', '', ...details].join('\\n'))
}

const validatedEntries = caseEntries.map(entry => ({
  case: validateCaseEntry(entry),
  path: entry.path,
}))

assertUniqueCaseIds(validatedEntries)

export const cases = validatedEntries.map(entry => entry.case)
export const caseEntries = validatedEntries
`
}

function generateEntryModule(configPath: string): string {
  // Use forward slashes on all platforms (Vite requirement)
  const normalizedConfig = configPath.replace(/\\/g, '/')
  return [
    `import { createApp } from 'vue'`,
    `import WorkbenchApp from '@mountlab/vue/runtime'`,
    `import { cases, caseEntries } from 'virtual:mountlab/cases'`,
    `import userConfig from ${JSON.stringify(normalizedConfig)}`,
    ``,
    `const app = createApp(WorkbenchApp)`,
    `app.provide('mountlab:cases', cases)`,
    `app.provide('mountlab:caseEntries', caseEntries)`,
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
        return generateCasesModule(casePaths, root)
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

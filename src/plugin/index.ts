import path from 'node:path'
import { readFileSync } from 'node:fs'
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

async function resolveComponentPaths(patterns: string[] | undefined, root: string): Promise<string[]> {
  if (!patterns || patterns.length === 0) return []
  const files = await fg(patterns, { cwd: root, absolute: true })
  return files
    .filter(file => file.endsWith('.vue'))
    .sort((a, b) => a.localeCompare(b))
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

function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function toTitle(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getComponentStem(componentPath: string): string {
  const basename = path.basename(componentPath, '.vue')
  if (basename !== 'index') return basename
  return path.basename(path.dirname(componentPath))
}

function getExpectedSidecarPath(componentPath: string): string {
  const dir = path.dirname(componentPath)
  const basename = path.basename(componentPath, '.vue')
  const stem = basename === 'index'
    ? toTitle(path.basename(dir)).replace(/\s+/g, '')
    : basename

  return path.join(dir, `${stem}.case.ts`)
}

interface AuthoredCaseRegistryEntry {
  kind: 'authored'
  filePath: string
  importName: string
}

interface SyntheticCaseRegistryEntry {
  kind: 'synthetic'
  filePath: string
  importName: string
  id: string
  title: string
  events: string[]
}

type CaseRegistryEntry = AuthoredCaseRegistryEntry | SyntheticCaseRegistryEntry

function resolveCaseRegistryEntries(
  casePaths: string[],
  componentPaths: string[],
  root: string,
): CaseRegistryEntry[] {
  const authoredSidecars = new Set(casePaths.map(formatModulePath))
  const authoredEntries: CaseRegistryEntry[] = casePaths.map((filePath, index) => ({
    kind: 'authored',
    filePath,
    importName: `case${index}`,
  }))
  const syntheticEntries: CaseRegistryEntry[] = componentPaths
    .filter(componentPath => !authoredSidecars.has(formatModulePath(getExpectedSidecarPath(componentPath))))
    .map((filePath, index) => {
      const stem = getComponentStem(filePath)
      return {
        kind: 'synthetic',
        filePath,
        importName: `component${index}`,
        id: toKebabCase(stem),
        title: toTitle(stem),
        events: inferComponentEvents(filePath),
      }
    })

  return [...authoredEntries, ...syntheticEntries]
    .sort((a, b) =>
      formatDiagnosticPath(a.filePath, root).localeCompare(formatDiagnosticPath(b.filePath, root)),
    )
}

function findMatchingDelimiter(source: string, openIndex: number, open: string, close: string): number {
  let depth = 0
  let quote: string | null = null
  let escaped = false

  for (let index = openIndex; index < source.length; index++) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === open) depth++
    if (char === close) depth--
    if (depth === 0) return index
  }

  return -1
}

function splitTopLevelMembers(source: string): string[] {
  const members: string[] = []
  let start = 0
  let parenDepth = 0
  let bracketDepth = 0
  let braceDepth = 0
  let angleDepth = 0
  let quote: string | null = null
  let escaped = false

  for (let index = 0; index < source.length; index++) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '(') parenDepth++
    else if (char === ')') parenDepth--
    else if (char === '[') bracketDepth++
    else if (char === ']') bracketDepth--
    else if (char === '{') braceDepth++
    else if (char === '}') braceDepth--
    else if (char === '<') angleDepth++
    else if (char === '>') angleDepth--

    if (
      (char === ';' || char === ',' || char === '\n')
      && parenDepth === 0
      && bracketDepth === 0
      && braceDepth === 0
      && angleDepth === 0
    ) {
      members.push(source.slice(start, index).trim())
      start = index + 1
    }
  }

  const trailing = source.slice(start).trim()
  if (trailing) members.push(trailing)
  return members
}

function extractStringLiteralArray(source: string): string[] {
  const arrayEnd = findMatchingDelimiter(source, 0, '[', ']')
  if (arrayEnd !== source.length - 1) return []

  const events: string[] = []
  for (const member of splitTopLevelMembers(source.slice(1, -1))) {
    const literal = member.match(/^(['"])((?:\\.|(?!\1).)*)\1$/s)
    if (!literal) return []
    events.push(literal[2].replace(/\\(['"\\])/g, '$1'))
  }

  return events
}

function extractTypeEvents(typeArgument: string): string[] {
  const events = new Set<string>()
  const trimmed = typeArgument.trim()
  const objectBody = trimmed.startsWith('{') && trimmed.endsWith('}')
    ? trimmed.slice(1, -1)
    : trimmed

  for (const member of splitTopLevelMembers(objectBody)) {
    const callSignature = member.match(/^\(\s*[^:),]+\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/s)
    if (callSignature) {
      events.add(callSignature[2].replace(/\\(['"\\])/g, '$1'))
      continue
    }

    const quotedKey = member.match(/^(['"])((?:\\.|(?!\1).)*)\1\s*\??\s*:/s)
    if (quotedKey) {
      events.add(quotedKey[2].replace(/\\(['"\\])/g, '$1'))
      continue
    }

    const bareKey = member.match(/^([A-Za-z_$][\w$]*)\s*\??\s*:/)
    if (bareKey) events.add(bareKey[1])
  }

  return [...events]
}

function extractDefineEmitsEvents(source: string): string[] {
  const events = new Set<string>()
  let searchFrom = 0

  while (searchFrom < source.length) {
    const callIndex = source.indexOf('defineEmits', searchFrom)
    if (callIndex === -1) break

    const previous = source[callIndex - 1]
    const next = source[callIndex + 'defineEmits'.length]
    if ((previous && /[\w$]/.test(previous)) || (next && /[\w$]/.test(next))) {
      searchFrom = callIndex + 'defineEmits'.length
      continue
    }

    let cursor = callIndex + 'defineEmits'.length
    while (/\s/.test(source[cursor] ?? '')) cursor++

    if (source[cursor] === '<') {
      const typeEnd = findMatchingDelimiter(source, cursor, '<', '>')
      if (typeEnd !== -1) {
        for (const eventName of extractTypeEvents(source.slice(cursor + 1, typeEnd))) {
          events.add(eventName)
        }
        cursor = typeEnd + 1
        while (/\s/.test(source[cursor] ?? '')) cursor++
      }
    }

    if (source[cursor] === '(') {
      const argsEnd = findMatchingDelimiter(source, cursor, '(', ')')
      if (argsEnd !== -1) {
        const argument = source.slice(cursor + 1, argsEnd).trim()
        if (argument.startsWith('[')) {
          for (const eventName of extractStringLiteralArray(argument)) {
            events.add(eventName)
          }
        }
        searchFrom = argsEnd + 1
        continue
      }
    }

    searchFrom = cursor + 1
  }

  return [...events]
}

function inferComponentEvents(filePath: string): string[] {
  try {
    return extractDefineEmitsEvents(readFileSync(filePath, 'utf-8'))
  } catch {
    return []
  }
}

function generateCasesModule(casePaths: string[], componentPaths: string[], root: string): string {
  const registryEntries = resolveCaseRegistryEntries(casePaths, componentPaths, root)
  const imports = registryEntries
    .map(entry => `import ${entry.importName} from ${JSON.stringify(formatModulePath(entry.filePath))}`)
    .join('\n')
  const entries = registryEntries
    .map((entry) => {
      const diagnosticPath = JSON.stringify(formatDiagnosticPath(entry.filePath, root))
      if (entry.kind === 'authored') {
        return `  { value: ${entry.importName}, path: ${diagnosticPath} }`
      }

      return [
        `  {`,
        `    value: {`,
        `      id: ${JSON.stringify(entry.id)},`,
        `      title: ${JSON.stringify(entry.title)},`,
        `      component: ${entry.importName},`,
        `      variants: [{ id: 'default', title: 'Default', props: {} }],`,
        ...(entry.events.length > 0
          ? [`      events: ${JSON.stringify(entry.events)},`]
          : []),
        `    },`,
        `    path: ${diagnosticPath},`,
        `  }`,
      ].join('\n')
    })
    .join(',\n')

  return `${imports}

const rawCaseEntries = [
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

const validatedEntries = rawCaseEntries.map(entry => ({
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>html,body{margin:0;padding:0;height:100%;}</style>
</head>
<body>
  <div id="mountlab"></div>
  <script type="module" src="/__mountlab/entry.js"></script>
</body>
</html>`
}

export function isWorkbenchHtmlRequest(url: string | undefined): boolean {
  const pathname = url?.split('?')[0]
  return pathname === '/' || pathname === '/index.html'
}

export function mountlab(config: MountLabConfig = {}): Plugin {
  let root = process.cwd()
  let configPath = path.join(root, 'mountlab.config.ts')
  let casePaths: string[] = []
  let componentPaths: string[] = []

  return {
    name: 'mountlab',

    configResolved(resolved) {
      root = resolved.root
      configPath = path.join(root, 'mountlab.config.ts')
    },

    configureServer(server: ViteDevServer) {
      // Serve workbench HTML at root
      server.middlewares.use((req, res, next) => {
        if (isWorkbenchHtmlRequest(req.url)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(getHtmlShell())
          return
        }
        next()
      })

      // Watch for case file changes and trigger full reload
      const casePatterns = config.cases ?? ['src/**/*.case.ts']
      const componentPatterns = config.components ?? []
      const patterns = [...casePatterns, ...componentPatterns]
      const absPatterns = patterns.map(p =>
        path.isAbsolute(p) ? p : path.join(root, p),
      )

      server.watcher.add(absPatterns)

      async function invalidateCases() {
        const mod = server.moduleGraph.getModuleById(RESOLVED_CASES)
        if (mod) server.moduleGraph.invalidateModule(mod)
        casePaths = await resolveCasePaths(config.cases ?? [], root)
        componentPaths = await resolveComponentPaths(config.components, root)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', (file) => {
        if (file.endsWith('.case.ts') || file.endsWith('.vue')) invalidateCases()
      })

      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.case.ts') || file.endsWith('.vue')) invalidateCases()
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
        componentPaths = await resolveComponentPaths(config.components, root)
        return generateCasesModule(casePaths, componentPaths, root)
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

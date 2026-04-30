import fs from 'node:fs'
import path from 'node:path'

export interface AddOptions {
  group: string
  wrapper: string
  dryRun: boolean
  force: boolean
}

// ---------------------------------------------------------------------------
// Name inference
// ---------------------------------------------------------------------------

export function inferComponentName(filePath: string): {
  id: string
  title: string
  stem: string
} {
  const basename = path.basename(filePath, '.vue')
  const dir = path.dirname(filePath)

  const rawStem = basename === 'index' ? path.basename(dir) : basename

  const id = toKebabCase(rawStem)
  const title = id
    .split('-')
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ')

  return { id, title, stem: rawStem }
}

function toKebabCase(str: string): string {
  return str
    // UIButton → UI-Button (consecutive uppercase followed by lowercase)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // productCard → product-Card
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    // replace underscores and spaces
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

// ---------------------------------------------------------------------------
// Case file template
// ---------------------------------------------------------------------------

function buildCaseFileContent(opts: {
  id: string
  title: string
  group: string
  wrapper: string
  componentName: string
  importPath: string
}): string {
  return `import { defineComponentCase } from '@mountlab/vue'
import ${opts.componentName} from '${opts.importPath}'

export default defineComponentCase({
  id: '${opts.id}',
  title: '${opts.title}',
  group: '${opts.group}',

  component: ${opts.componentName},
  wrapper: '${opts.wrapper}',

  variants: [
    {
      id: 'default',
      title: 'Default',
      props: {
        // TODO: add props
      },
    },
  ],

  events: [
    // 'click',
    // 'submit',
  ],
})
`
}

// ---------------------------------------------------------------------------
// Main command
// ---------------------------------------------------------------------------

export async function runAdd(componentPath: string, options: AddOptions): Promise<void> {
  const cwd = process.cwd()
  const absoluteComponent = path.isAbsolute(componentPath)
    ? componentPath
    : path.resolve(cwd, componentPath)

  // 2.2 — file existence
  if (!fs.existsSync(absoluteComponent)) {
    console.error(`[MountLab] Error: file not found: ${componentPath}`)
    process.exit(1)
  }

  // 2.3 — .vue extension
  if (path.extname(absoluteComponent) !== '.vue') {
    console.error(`[MountLab] Error: only .vue files are supported (got: ${path.basename(absoluteComponent)})`)
    process.exit(1)
  }

  // 3.1–3.3 — name inference
  const { id, title, stem } = inferComponentName(absoluteComponent)

  // 8.1 — print inferred metadata immediately
  console.log(`[MountLab] mountlab add`)
  console.log(`  component : ${path.relative(cwd, absoluteComponent)}`)
  console.log(`  id        : ${id}`)
  console.log(`  title     : ${title}`)
  console.log()

  // 4.1–4.2 — output path
  const componentDir = path.dirname(absoluteComponent)
  const componentBasename = path.basename(absoluteComponent, '.vue')
  const isIndex = componentBasename === 'index'

  // PascalCase stem for the case filename when dealing with index.vue
  const caseFileStem = isIndex
    ? title.replace(/\s+/g, '')
    : componentBasename

  const outputPath = path.join(componentDir, `${caseFileStem}.case.ts`)
  const outputRelative = path.relative(cwd, outputPath)

  // 5.1 — guard against overwriting (skip check in dry-run; dry-run shows intent instead)
  const existed = fs.existsSync(outputPath)
  if (existed && !options.force && !options.dryRun) {
    console.error(`  Already exists: ${outputRelative}`)
    console.error('  Run with --force to overwrite.')
    process.exit(1)
  }

  // 6.1 — relative import path (always ./filename.vue)
  const importPath = `./${path.basename(absoluteComponent)}`

  // PascalCase component identifier for the import statement
  const componentName = stem
    .split('-')
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join('')

  const content = buildCaseFileContent({
    id,
    title,
    group: options.group,
    wrapper: options.wrapper,
    componentName,
    importPath,
  })

  // 7.1–7.2 — dry-run
  if (options.dryRun) {
    const action = existed ? 'overwrite' : 'create'
    console.log(`  [dry-run] Would ${action}: ${outputRelative}`)
    console.log('\n  [dry-run] No files written.')
    return
  }

  // 6.2–6.3 — write file
  fs.writeFileSync(outputPath, content, 'utf-8')

  // 5.2 / 8.2–8.3 — success message
  const action = existed ? 'Overwrote' : 'Created'
  console.log(`  ✓ ${action} ${outputRelative}`)

  // 8.4 — completion hint
  console.log('\n  Edit the generated file to add variants, then run `mountlab dev`.')
}

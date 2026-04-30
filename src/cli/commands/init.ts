import fs from 'node:fs'
import path from 'node:path'

export interface InitOptions {
  dryRun: boolean
  force: boolean
}

// ---------------------------------------------------------------------------
// Generated file templates
// ---------------------------------------------------------------------------

const MOUNTLAB_CONFIG = `import { defineMountLabConfig } from '@mountlab/vue'
import DefaultWrapper from './src/mountlab/wrappers/DefaultWrapper.vue'

export default defineMountLabConfig({
  port: 4300,

  cases: ['src/**/*.case.ts'],

  wrappers: {
    default: DefaultWrapper,
  },

  defaultWrapper: 'default',

  setupApp(app) {
    // Add app plugins here, for example:
    // app.use(createPinia())
    // app.use(PrimeVue)
  },
})
`

const DEFAULT_WRAPPER_VUE = `<script setup lang="ts">
// Default MountLab wrapper — replace with your app shell.
// Add global providers, layout context, or plugin setup here.
</script>

<template>
  <div class="ml-default-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.ml-default-wrapper {
  min-height: 100vh;
  padding: 1.5rem;
  background: #f9fafb;
}
</style>
`

// ---------------------------------------------------------------------------

interface FileSpec {
  label: string
  absolutePath: string
  content: string
}

export async function runInit(options: InitOptions): Promise<void> {
  const cwd = process.cwd()

  const files: FileSpec[] = [
    {
      label: 'mountlab.config.ts',
      absolutePath: path.join(cwd, 'mountlab.config.ts'),
      content: MOUNTLAB_CONFIG,
    },
    {
      label: 'src/mountlab/wrappers/DefaultWrapper.vue',
      absolutePath: path.join(cwd, 'src', 'mountlab', 'wrappers', 'DefaultWrapper.vue'),
      content: DEFAULT_WRAPPER_VUE,
    },
  ]

  console.log('[MountLab] Initializing...\n')

  // Guard: block if any file exists and --force was not requested
  if (!options.dryRun && !options.force) {
    const existing = files.filter((f) => fs.existsSync(f.absolutePath))
    if (existing.length > 0) {
      for (const f of existing) {
        console.error(`  Already exists: ${f.label}`)
      }
      console.error('\n  Run with --force to overwrite existing files.')
      process.exit(1)
    }
  }

  for (const file of files) {
    if (options.dryRun) {
      const exists = fs.existsSync(file.absolutePath)
      const action = exists ? 'overwrite' : 'create'
      console.log(`  [dry-run] Would ${action}: ${file.label}`)
      continue
    }

    fs.mkdirSync(path.dirname(file.absolutePath), { recursive: true })
    const existed = fs.existsSync(file.absolutePath)
    fs.writeFileSync(file.absolutePath, file.content, 'utf-8')
    const action = existed ? 'Overwrote' : 'Created'
    console.log(`  ✓ ${action} ${file.label}`)
  }

  if (options.dryRun) {
    console.log('\n  [dry-run] No files written.')
  } else {
    console.log('\n  Done. Edit mountlab.config.ts, then run `mountlab dev`.')
  }
}

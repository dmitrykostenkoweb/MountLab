import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createServer, mergeConfig, loadConfigFromFile } from 'vite'
import { mountlab } from '../../plugin/index.js'
import type { MountLabConfig } from '../../core/types.js'

/**
 * Bundles mountlab.config.ts with esbuild, stubbing .vue imports as empty
 * objects so Node can evaluate the config without a Vue transform pipeline.
 * Wrappers are Vue components — we don't need them at startup; the browser
 * loads the full config via Vite's transform pipeline through the virtual entry.
 */
async function loadMountLabConfig(cwd: string): Promise<MountLabConfig> {
  const configPath = path.join(cwd, 'mountlab.config.ts')
  if (!fs.existsSync(configPath)) {
    console.error('[MountLab] Error: mountlab.config.ts not found.')
    console.error('  Run `mountlab init` to create one.')
    process.exit(1)
  }

  // esbuild is a guaranteed transitive dep of vite (peer dep)
  const esbuild = await import('esbuild')

  const result = await esbuild.build({
    entryPoints: [configPath],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    // Externalize anything that would cause Node to trip on missing loaders.
    // .vue stubs below replace them with empty default exports so the config
    // object still loads; actual wrappers are resolved by Vite in the browser.
    external: ['vue', 'vite', '@mountlab/vue', 'pinia', 'primevue'],
    plugins: [
      {
        name: 'stub-vue',
        setup(build) {
          build.onLoad({ filter: /\.vue$/ }, () => ({
            contents: 'export default {}',
            loader: 'js',
          }))
        },
      },
    ],
  })

  const bundledCode = result.outputFiles[0].text
  // Write inside cwd so Node resolves externalized packages from project node_modules
  const tmpFile = path.join(cwd, `.mountlab-config-${Date.now()}.mjs`)
  fs.writeFileSync(tmpFile, bundledCode, 'utf-8')

  try {
    const mod = await import(pathToFileURL(tmpFile).href)
    return (mod.default ?? {}) as MountLabConfig
  } finally {
    fs.unlinkSync(tmpFile)
  }
}

export async function runDev(): Promise<void> {
  const cwd = process.cwd()

  const mountLabConfig = await loadMountLabConfig(cwd)
  const port = mountLabConfig.port ?? 4300

  const userViteResult = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    undefined,
    cwd,
  )
  const userViteConfig = userViteResult?.config ?? {}

  const mergedConfig = mergeConfig(userViteConfig, {
    root: cwd,
    // Prevent createServer from re-loading vite.config.ts — we've already
    // merged it above; a second load would duplicate plugins like vue().
    configFile: false,
    server: { port, strictPort: true },
    plugins: [mountlab(mountLabConfig)],
    appType: 'custom' as const,
  })

  let server
  try {
    server = await createServer(mergedConfig)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('EADDRINUSE')) {
      console.error(`[MountLab] Error: Port ${port} is already in use.`)
      console.error(`  Change the port in mountlab.config.ts or stop the process using port ${port}.`)
      process.exit(1)
    }
    throw err
  }

  await server.listen()
  server.printUrls()
  console.log()
  console.log('[MountLab] Workbench ready. Press Ctrl+C to stop.')
}

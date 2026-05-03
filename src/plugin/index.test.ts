import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Plugin } from 'vite'
import { isWorkbenchHtmlRequest, mountlab } from './index.js'

function pluginLoad(plugin: Plugin, id: string): Promise<unknown> | unknown {
  if (typeof plugin.load !== 'function') {
    throw new Error('Expected load hook')
  }

  return plugin.load.call({} as never, id)
}

function resolveConfig(plugin: Plugin, root: string): void {
  if (typeof plugin.configResolved === 'function') {
    plugin.configResolved.call({} as never, { root } as never)
  }
}

describe('mountlab vite plugin', () => {
  it('serves the workbench shell for root URLs with query state', () => {
    expect(isWorkbenchHtmlRequest('/')).toBe(true)
    expect(isWorkbenchHtmlRequest('/?viewport=custom&viewportWidth=640&viewportHeight=480')).toBe(true)
    expect(isWorkbenchHtmlRequest('/index.html?case=button')).toBe(true)
    expect(isWorkbenchHtmlRequest('/src/main.ts')).toBe(false)
  })

  it('generates case metadata with stable relative paths', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'b'), { recursive: true })
    mkdirSync(path.join(root, 'src', 'a'), { recursive: true })
    writeFileSync(path.join(root, 'src', 'b', 'Second.case.ts'), 'export default {}')
    writeFileSync(path.join(root, 'src', 'a', 'First.case.ts'), 'export default {}')

    const plugin = mountlab({ cases: ['src/**/*.case.ts'] })
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('const rawCaseEntries = [')
    expect(code).toContain('const validatedEntries = rawCaseEntries.map')
    expect(code).toContain('export const caseEntries = validatedEntries')
    expect(code.indexOf('src/a/First.case.ts')).toBeLessThan(code.indexOf('src/b/Second.case.ts'))
  })

  it('keeps readable invalid and duplicate case diagnostics in the generated registry', async () => {
    const plugin = mountlab()
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('[MountLab] Invalid component case in ')
    expect(code).toContain('[MountLab] Duplicate component case IDs')
    expect(code).toContain('component is required')
    expect(code).toContain('variants must be an array')
  })
})

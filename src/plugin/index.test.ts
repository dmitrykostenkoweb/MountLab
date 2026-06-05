import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Plugin } from 'vite'
import type { MountLabConfig } from '../core/types.js'
import { isWorkbenchHtmlRequest, mountlab } from './index.js'

const configWithComponentDiscovery: MountLabConfig = {
  components: ['src/components/**/*.vue'],
}

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

  it('generates synthetic cases for configured Vue components', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(path.join(root, 'src', 'components', 'ProductCard.vue'), '<template />')

    const plugin = mountlab(configWithComponentDiscovery)
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('import component0 from ')
    expect(code).toContain('src/components/ProductCard.vue')
    expect(code).toContain('id: "product-card"')
    expect(code).toContain('title: "Product Card"')
    expect(code).toContain('component: component0')
    expect(code).toContain("variants: [{ id: 'default', title: 'Default', props: {} }]")
  })

  it('infers synthetic case events from array defineEmits declarations', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(
      path.join(root, 'src', 'components', 'ProductCard.vue'),
      `<script setup lang="ts">
const emit = defineEmits(['select', 'restock'])
</script>
<template />`,
    )

    const plugin = mountlab(configWithComponentDiscovery)
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('events: ["select","restock"]')
  })

  it('infers synthetic case events from type literal defineEmits declarations', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(
      path.join(root, 'src', 'components', 'ProductCard.vue'),
      `<script setup lang="ts">
const emit = defineEmits<{
  select: [payload: { id: string }]
  'update:modelValue': [value: string]
  (event: 'restock', amount: number): void
}>()
</script>
<template />`,
    )

    const plugin = mountlab(configWithComponentDiscovery)
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('events: ["select","update:modelValue","restock"]')
  })

  it('keeps synthetic discovery working when defineEmits cannot be inferred', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(
      path.join(root, 'src', 'components', 'ProductCard.vue'),
      `<script setup lang="ts">
const events = ['select']
const emit = defineEmits(events)
</script>
<template />`,
    )

    const plugin = mountlab(configWithComponentDiscovery)
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('src/components/ProductCard.vue')
    expect(code).toContain('id: "product-card"')
    expect(code).not.toContain('events:')
  })

  it('does not discover raw Vue components when component discovery is omitted', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(path.join(root, 'src', 'components', 'ProductCard.vue'), '<template />')

    const plugin = mountlab({ cases: [] })
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).not.toContain('ProductCard.vue')
    expect(code).not.toContain('product-card')
  })

  it('lets authored sidecar cases suppress synthetic component cases', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components', 'product-card'), { recursive: true })
    writeFileSync(path.join(root, 'src', 'components', 'ProductCard.vue'), '<template />')
    writeFileSync(path.join(root, 'src', 'components', 'ProductCard.case.ts'), 'export default {}')
    writeFileSync(path.join(root, 'src', 'components', 'product-card', 'index.vue'), '<template />')
    writeFileSync(path.join(root, 'src', 'components', 'product-card', 'ProductCard.case.ts'), 'export default {}')

    const plugin = mountlab({
      cases: ['src/**/*.case.ts'],
      components: ['src/components/**/*.vue'],
    })
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('src/components/ProductCard.case.ts')
    expect(code).toContain('src/components/product-card/ProductCard.case.ts')
    expect(code).not.toContain('src/components/ProductCard.vue')
    expect(code).not.toContain('src/components/product-card/index.vue')
    expect(code).not.toContain('component: component0')
  })

  it('does not merge inferred events into authored sidecar cases', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'components'), { recursive: true })
    writeFileSync(
      path.join(root, 'src', 'components', 'ProductCard.vue'),
      `<script setup lang="ts">
defineEmits(['select'])
</script>
<template />`,
    )
    writeFileSync(path.join(root, 'src', 'components', 'ProductCard.case.ts'), 'export default {}')

    const plugin = mountlab({
      cases: ['src/**/*.case.ts'],
      components: ['src/components/**/*.vue'],
    })
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code).toContain('src/components/ProductCard.case.ts')
    expect(code).not.toContain('src/components/ProductCard.vue')
    expect(code).not.toContain('events:')
  })

  it('uses deterministic ordering after merging authored and synthetic cases', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'mountlab-plugin-'))
    mkdirSync(path.join(root, 'src', 'a'), { recursive: true })
    mkdirSync(path.join(root, 'src', 'b'), { recursive: true })
    writeFileSync(path.join(root, 'src', 'b', 'Second.vue'), '<template />')
    writeFileSync(path.join(root, 'src', 'a', 'First.case.ts'), 'export default {}')

    const plugin = mountlab({
      cases: ['src/**/*.case.ts'],
      components: ['src/**/*.vue'],
    })
    resolveConfig(plugin, root)
    const code = String(await pluginLoad(plugin, '\0mountlab:cases'))

    expect(code.indexOf('src/a/First.case.ts')).toBeLessThan(code.indexOf('src/b/Second.vue'))
    expect(code).toContain('[MountLab] Duplicate component case IDs')
    expect(code).toContain('Found in:')
  })
})

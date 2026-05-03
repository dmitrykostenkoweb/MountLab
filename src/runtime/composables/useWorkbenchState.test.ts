import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'
import type { ComponentCase, MountLabConfig } from '../../core/types.js'
import {
  normalizeViewportDimensions,
  resolveWrapperSelection,
  useWorkbenchState,
} from './useWorkbenchState.js'

const ComponentStub = {} as Component

function componentCase(wrapper?: string): ComponentCase {
  return {
    id: 'button',
    component: ComponentStub,
    wrapper,
    variants: [{ id: 'default', props: {} }],
  }
}

function propsCase(schema?: unknown): ComponentCase {
  return {
    id: 'form',
    component: ComponentStub,
    propsSchema: schema,
    variants: [{ id: 'default', props: { label: 'Save' } }],
    events: ['submit'],
  }
}

function config(
  wrappers: MountLabConfig['wrappers'],
  defaultWrapper?: string,
  viewports?: MountLabConfig['viewports'],
): MountLabConfig {
  return { wrappers, defaultWrapper, viewports }
}

function stubBrowserUrl(href: string) {
  const location = new URL(href)
  const history = {
    state: null,
    replaceState: vi.fn((_state: unknown, _unused: string, url: URL) => {
      const next = new URL(String(url))
      location.href = next.href
      location.search = next.search
    }),
  }

  vi.stubGlobal('window', { location, history })

  return { location, history }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveWrapperSelection', () => {
  it('uses the case wrapper without warning when it exists', () => {
    const resolution = resolveWrapperSelection(
      config({ card: ComponentStub, default: ComponentStub }, 'default'),
      componentCase('card'),
      null,
    )

    expect(resolution).toEqual({
      requestedKey: 'card',
      resolvedKey: 'card',
      missingKeys: [],
      fallbackReason: null,
    })
  })

  it('falls back to the default wrapper when the case wrapper is missing', () => {
    const resolution = resolveWrapperSelection(
      config({ default: ComponentStub }, 'default'),
      componentCase('missing-case-wrapper'),
      null,
    )

    expect(resolution).toEqual({
      requestedKey: 'missing-case-wrapper',
      resolvedKey: 'default',
      missingKeys: ['missing-case-wrapper'],
      fallbackReason: 'missing-case',
    })
  })

  it('falls back to the built-in empty wrapper when case and default wrappers are missing', () => {
    const resolution = resolveWrapperSelection(
      config({}, 'missing-default-wrapper'),
      componentCase('missing-case-wrapper'),
      null,
    )

    expect(resolution).toEqual({
      requestedKey: 'missing-case-wrapper',
      resolvedKey: null,
      missingKeys: ['missing-case-wrapper', 'missing-default-wrapper'],
      fallbackReason: 'missing-case',
    })
  })

  it('normalizes a missing explicit wrapper to a valid fallback wrapper', () => {
    const resolution = resolveWrapperSelection(
      config({ card: ComponentStub, default: ComponentStub }, 'default'),
      componentCase('card'),
      'missing-url-wrapper',
    )

    expect(resolution).toEqual({
      requestedKey: 'missing-url-wrapper',
      resolvedKey: 'card',
      missingKeys: ['missing-url-wrapper'],
      fallbackReason: 'missing-explicit',
    })
  })

  it('exposes a warning while keeping preview wrapper fallback usable', () => {
    const state = useWorkbenchState(
      [componentCase('missing-case-wrapper')],
      config({ default: ComponentStub }, 'default'),
    )

    expect(state.selectedWrapperKey.value).toBe('default')
    expect(state.wrapperComponent.value).toBe(ComponentStub)
    expect(state.wrapperWarning.value).toContain('"missing-case-wrapper"')
    expect(state.wrapperWarning.value).toContain('Using "default" instead')
  })

  it('exposes a warning while using the built-in empty wrapper fallback', () => {
    const state = useWorkbenchState(
      [componentCase('missing-case-wrapper')],
      config({}, 'missing-default-wrapper'),
    )

    expect(state.selectedWrapperKey.value).toBeNull()
    expect(state.wrapperComponent.value).toBeNull()
    expect(state.wrapperWarning.value).toContain('"missing-case-wrapper"')
    expect(state.wrapperWarning.value).toContain('"missing-default-wrapper"')
    expect(state.wrapperWarning.value).toContain('built-in empty wrapper')
  })

  it('restores and synchronizes viewport URL state', () => {
    const { location, history } = stubBrowserUrl('http://localhost:4300/?keep=1&viewport=mobile')
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
        desktop: { width: 1280, height: 800 },
      }),
    )

    expect(state.selectedViewportKey.value).toBe('mobile')
    expect(state.selectedViewport.value).toEqual({ width: 390, height: 844 })

    state.selectViewport('desktop')

    expect(location.search).toContain('keep=1')
    expect(location.search).toContain('viewport=desktop')
    expect(history.replaceState).toHaveBeenCalled()
  })

  it('falls back from invalid viewport URL params to auto mode', () => {
    stubBrowserUrl('http://localhost:4300/?viewport=missing')
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
      }),
    )

    expect(state.selectedViewportKey.value).toBe('auto')
    expect(state.selectedViewport.value).toBeNull()
  })

  it('restores and synchronizes custom viewport URL state', () => {
    const { location } = stubBrowserUrl(
      'http://localhost:4300/?keep=1&viewport=custom&viewportWidth=1980&viewportHeight=1080',
    )
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
      }),
    )

    expect(state.selectedViewportKey.value).toBe('custom')
    expect(state.selectedViewport.value).toEqual({ width: 1980, height: 1080 })
    expect(state.editableViewport.value).toEqual({ width: 1980, height: 1080 })

    state.setCustomViewportDimensions({ width: 1440 })

    expect(location.search).toContain('keep=1')
    expect(location.search).toContain('viewport=custom')
    expect(location.search).toContain('viewportWidth=1440')
    expect(location.search).toContain('viewportHeight=1080')
  })

  it('falls back from invalid custom viewport URL params to auto mode', () => {
    const { location } = stubBrowserUrl(
      'http://localhost:4300/?viewport=custom&viewportWidth=wide&viewportHeight=0',
    )
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
      }),
    )

    expect(state.selectedViewportKey.value).toBe('auto')
    expect(state.selectedViewport.value).toBeNull()
    expect(location.search).toContain('viewport=auto')
    expect(location.search).not.toContain('viewportWidth')
    expect(location.search).not.toContain('viewportHeight')
  })

  it('switches preset viewport edits to custom while preserving the other dimension', () => {
    const { location } = stubBrowserUrl('http://localhost:4300/?viewport=mobile')
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
        desktop: { width: 1280, height: 800 },
      }),
    )

    state.setCustomViewportDimensions({ width: '420' as unknown as number })

    expect(state.selectedViewportKey.value).toBe('custom')
    expect(state.selectedViewport.value).toEqual({ width: 420, height: 844 })
    expect(location.search).toContain('viewport=custom')
    expect(location.search).toContain('viewportWidth=420')
    expect(location.search).toContain('viewportHeight=844')
  })

  it('clamps custom viewport dimensions and ignores invalid edits', () => {
    stubBrowserUrl('http://localhost:4300/')
    const state = useWorkbenchState([componentCase()], config({}, undefined))

    state.setCustomViewportDimensions({ width: 99999, height: 1 })

    expect(state.selectedViewportKey.value).toBe('custom')
    expect(state.selectedViewport.value).toEqual({ width: 7680, height: 100 })

    state.setCustomViewportDimensions({ width: 'bad' as unknown as number })

    expect(state.selectedViewport.value).toEqual({ width: 7680, height: 100 })
  })

  it('keeps preset and auto viewport behavior after using custom dimensions', () => {
    const { location } = stubBrowserUrl('http://localhost:4300/')
    const state = useWorkbenchState(
      [componentCase()],
      config({}, undefined, {
        mobile: { width: 390, height: 844 },
      }),
    )

    state.setCustomViewportDimensions({ width: 500, height: 600 })
    state.selectViewport('mobile')

    expect(state.selectedViewportKey.value).toBe('mobile')
    expect(state.selectedViewport.value).toEqual({ width: 390, height: 844 })
    expect(location.search).toContain('viewport=mobile')
    expect(location.search).not.toContain('viewportWidth')

    state.selectViewport('auto')

    expect(state.selectedViewportKey.value).toBe('auto')
    expect(state.selectedViewport.value).toBeNull()
  })

  it('normalizes viewport dimensions', () => {
    expect(normalizeViewportDimensions('1980', '1080')).toEqual({ width: 1980, height: 1080 })
    expect(normalizeViewportDimensions('bad', '1080')).toBeNull()
    expect(normalizeViewportDimensions(10, 99999)).toEqual({ width: 100, height: 4320 })
  })

  it('copies the current normalized URL without changing selection state', async () => {
    const { location } = stubBrowserUrl('http://localhost:4300/?case=button&variant=default')
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const state = useWorkbenchState(
      [componentCase()],
      config({ default: ComponentStub }, 'default'),
    )

    await state.copyCurrentUrl()

    expect(writeText).toHaveBeenCalledWith(location.href)
    expect(state.selectedCaseId.value).toBe('button')
    expect(state.selectedVariantId.value).toBe('default')
    expect(state.selectedWrapperKey.value).toBe('default')
  })

  it('keeps the workbench usable when clipboard copying fails', async () => {
    stubBrowserUrl('http://localhost:4300/')
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const state = useWorkbenchState([componentCase()], config({}, undefined))

    await expect(state.copyCurrentUrl()).resolves.toBeUndefined()
    expect(state.selectedCaseId.value).toBe('button')
  })

  it('keeps last valid props for invalid JSON edits', () => {
    const state = useWorkbenchState([propsCase()], config({}, undefined))

    state.updatePropsJsonText('{')

    expect(state.currentProps.value).toEqual({ label: 'Save' })
    expect(state.propsJsonParseError.value).toContain('Expected')
    expect(state.propsValidationResult.value.status).toBe('invalid')
  })

  it('validates props through safeParse schemas', () => {
    const schema = {
      safeParse(value: unknown) {
        if (['Save', 'OK'].includes(String((value as { label?: unknown }).label))) {
          return { success: true, data: value }
        }

        return {
          success: false,
          error: {
            issues: [{
              path: ['label'],
              message: 'Expected OK',
              expected: 'OK',
              received: 'other',
            }],
          },
        }
      },
    }
    const state = useWorkbenchState([propsCase(schema)], config({}, undefined))

    state.updatePropsJsonText(JSON.stringify({ label: 'Bad' }))

    expect(state.currentProps.value).toEqual({ label: 'Save' })
    expect(state.propsValidationResult.value.status).toBe('invalid')
    expect(state.propsValidationResult.value.issues[0]).toMatchObject({
      path: 'label',
      expected: 'OK',
      received: 'other',
    })

    state.updatePropsJsonText(JSON.stringify({ label: 'OK' }))

    expect(state.currentProps.value).toEqual({ label: 'OK' })
    expect(state.propsValidationResult.value.status).toBe('valid')
  })

  it('records, clears, and resets event log on case changes', () => {
    const state = useWorkbenchState(
      [
        propsCase(),
        {
          id: 'other',
          component: ComponentStub,
          variants: [{ id: 'default', props: {} }],
        },
      ],
      config({}, undefined),
    )

    state.recordEvent('submit', { id: 1 })

    expect(state.eventLog.value).toHaveLength(1)
    expect(state.eventLog.value[0].name).toBe('submit')

    state.clearEventLog()

    expect(state.eventLog.value).toHaveLength(0)

    state.recordEvent('submit', { id: 2 })
    state.selectCase('other')

    expect(state.eventLog.value).toHaveLength(0)
  })

  it('copies props JSON without changing state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const state = useWorkbenchState([propsCase()], config({}, undefined))

    await state.copyPropsJson()

    expect(writeText).toHaveBeenCalledWith(state.propsJsonText.value)
    expect(state.currentProps.value).toEqual({ label: 'Save' })
  })
})

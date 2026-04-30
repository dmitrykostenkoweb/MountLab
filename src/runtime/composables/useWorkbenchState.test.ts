import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import type { ComponentCase, MountLabConfig } from '../../core/types.js'
import { resolveWrapperSelection, useWorkbenchState } from './useWorkbenchState.js'

const ComponentStub = {} as Component

function componentCase(wrapper?: string): ComponentCase {
  return {
    id: 'button',
    component: ComponentStub,
    wrapper,
    variants: [{ id: 'default', props: {} }],
  }
}

function config(
  wrappers: MountLabConfig['wrappers'],
  defaultWrapper?: string,
): MountLabConfig {
  return { wrappers, defaultWrapper }
}

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
})

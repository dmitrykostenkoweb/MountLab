import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant, MountLabConfig } from '../../core/types.js'

interface UrlSelection {
  caseId: string | null
  variantId: string | null
  wrapperKey: string | null
}

type PropsRecord = Record<string, unknown>

function canUseBrowserUrl(): boolean {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined'
}

function readUrlSelection(): UrlSelection {
  if (!canUseBrowserUrl()) {
    return { caseId: null, variantId: null, wrapperKey: null }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    caseId: params.get('case'),
    variantId: params.get('variant'),
    wrapperKey: params.get('wrapper'),
  }
}

function cloneProps(props: unknown): PropsRecord {
  if (props == null || typeof props !== 'object' || Array.isArray(props)) {
    return {}
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(props) as PropsRecord
    } catch {
      // Fall back to JSON cloning for fixture props that structuredClone rejects.
    }
  }

  return JSON.parse(JSON.stringify(props)) as PropsRecord
}

function hasWrapper(config: MountLabConfig, key: string | null | undefined): key is string {
  return typeof key === 'string' && !!config.wrappers?.[key]
}

function writeUrlSelection(selection: UrlSelection): void {
  if (!canUseBrowserUrl() || typeof window.history?.replaceState !== 'function') {
    return
  }

  const url = new URL(window.location.href)

  if (selection.caseId) url.searchParams.set('case', selection.caseId)
  else url.searchParams.delete('case')

  if (selection.variantId) url.searchParams.set('variant', selection.variantId)
  else url.searchParams.delete('variant')

  if (selection.wrapperKey) url.searchParams.set('wrapper', selection.wrapperKey)
  else url.searchParams.delete('wrapper')

  window.history.replaceState(window.history.state, '', url)
}

export function useWorkbenchState(cases: ComponentCase[], config: MountLabConfig) {
  const urlSelection = readUrlSelection()

  const selectedCaseId = ref<string | null>(urlSelection.caseId)
  const selectedVariantId = ref<string | null>(urlSelection.variantId)
  const selectedWrapperKey = ref<string | null>(urlSelection.wrapperKey)
  const currentProps = ref<PropsRecord>({})

  const selectedCase = computed<ComponentCase | null>(() =>
    cases.find(c => c.id === selectedCaseId.value) ?? null,
  )

  const selectedVariant = computed<ComponentVariant | null>(() =>
    selectedCase.value?.variants.find(v => v.id === selectedVariantId.value) ?? null,
  )

  const wrapperComponent = computed<Component | null>(() => {
    if (!selectedWrapperKey.value || !config.wrappers) return null
    return config.wrappers[selectedWrapperKey.value] ?? null
  })

  function resolveCaseId(candidate: string | null): string | null {
    if (candidate && cases.some(c => c.id === candidate)) return candidate
    return cases[0]?.id ?? null
  }

  function resolveVariantId(
    componentCase: ComponentCase | null,
    candidate: string | null,
  ): string | null {
    if (!componentCase) return null
    if (candidate && componentCase.variants.some(v => v.id === candidate)) return candidate
    return componentCase.variants[0]?.id ?? null
  }

  function resolveWrapperKey(
    componentCase: ComponentCase | null,
    candidate: string | null,
  ): string | null {
    if (hasWrapper(config, candidate)) return candidate
    if (hasWrapper(config, componentCase?.wrapper)) return componentCase.wrapper
    if (hasWrapper(config, config.defaultWrapper)) return config.defaultWrapper
    return null
  }

  function resetCurrentProps(): void {
    currentProps.value = cloneProps(selectedVariant.value?.props)
  }

  function normalizeSelection(options: { resetProps: boolean }): void {
    const caseId = resolveCaseId(selectedCaseId.value)
    const componentCase = cases.find(c => c.id === caseId) ?? null
    const variantId = resolveVariantId(componentCase, selectedVariantId.value)
    const wrapperKey = resolveWrapperKey(componentCase, selectedWrapperKey.value)

    selectedCaseId.value = caseId
    selectedVariantId.value = variantId
    selectedWrapperKey.value = wrapperKey

    if (options.resetProps) {
      resetCurrentProps()
    }

    writeUrlSelection({ caseId, variantId, wrapperKey })
  }

  function selectCase(caseId: string): void {
    selectedCaseId.value = caseId
    selectedVariantId.value = null
    selectedWrapperKey.value = null
    normalizeSelection({ resetProps: true })
  }

  function selectVariant(variantId: string): void {
    selectedVariantId.value = variantId
    normalizeSelection({ resetProps: true })
  }

  function selectWrapper(wrapperKey: string): void {
    selectedWrapperKey.value = wrapperKey
    normalizeSelection({ resetProps: false })
  }

  normalizeSelection({ resetProps: true })

  watch(
    () => [
      cases.map(c => `${c.id}:${c.variants.map(v => v.id).join(',')}`).join('|'),
      Object.keys(config.wrappers ?? {}).join('|'),
      config.defaultWrapper ?? '',
    ],
    () => normalizeSelection({ resetProps: true }),
  )

  return {
    selectedCaseId,
    selectedVariantId,
    selectedWrapperKey,
    selectedCase,
    selectedVariant,
    wrapperComponent,
    currentProps,
    selectCase,
    selectVariant,
    selectWrapper,
  }
}

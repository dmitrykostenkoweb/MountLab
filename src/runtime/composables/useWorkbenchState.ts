import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant, MountLabConfig, Viewport } from '../../core/types.js'

interface UrlSelection {
  caseId: string | null
  variantId: string | null
  wrapperKey: string | null
  viewportKey: string | null
}

type WrapperFallbackReason = 'missing-explicit' | 'missing-case' | 'missing-default' | null

type PropsRecord = Record<string, unknown>

export interface ValidationIssue {
  path: string
  message: string
  expected?: string
  received?: string
}

export type PropsValidationResult =
  | { status: 'unavailable'; message: string; issues: ValidationIssue[] }
  | { status: 'valid'; message: string; issues: ValidationIssue[] }
  | { status: 'invalid'; message: string; issues: ValidationIssue[] }

export interface EventLogEntry {
  id: number
  name: string
  timestamp: string
  payload: unknown
}

export interface WrapperResolution {
  requestedKey: string | null
  resolvedKey: string | null
  missingKeys: string[]
  fallbackReason: WrapperFallbackReason
}

export interface ViewportOption {
  key: string
  title: string
  viewport: Viewport | null
}

interface SafeParseSchema {
  safeParse: (value: unknown) => unknown
}

function canUseBrowserUrl(): boolean {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined'
}

function readUrlSelection(): UrlSelection {
  if (!canUseBrowserUrl()) {
    return { caseId: null, variantId: null, wrapperKey: null, viewportKey: null }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    caseId: params.get('case'),
    variantId: params.get('variant'),
    wrapperKey: params.get('wrapper'),
    viewportKey: params.get('viewport'),
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

function isPropsRecord(value: unknown): value is PropsRecord {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function formatPropsJson(props: PropsRecord): string {
  try {
    return JSON.stringify(props, null, 2)
  } catch {
    return '{}'
  }
}

function hasSafeParse(schema: unknown): schema is SafeParseSchema {
  return (
    schema != null
    && typeof schema === 'object'
    && 'safeParse' in schema
    && typeof (schema as { safeParse?: unknown }).safeParse === 'function'
  )
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatIssuePath(path: unknown): string {
  if (!Array.isArray(path)) {
    return stringifyUnknown(path)
  }

  return path.map(String).join('.')
}

function normalizeIssue(issue: unknown): ValidationIssue {
  const issueRecord = issue as {
    path?: unknown
    message?: unknown
    expected?: unknown
    received?: unknown
  } | null

  return {
    path: formatIssuePath(issueRecord?.path),
    message: stringifyUnknown(issueRecord?.message) || 'Props did not pass validation.',
    expected: issueRecord?.expected == null ? undefined : stringifyUnknown(issueRecord.expected),
    received: issueRecord?.received == null ? undefined : stringifyUnknown(issueRecord.received),
  }
}

function normalizeIssues(error: unknown): ValidationIssue[] {
  const candidateIssues = (error as { issues?: unknown; errors?: unknown } | null)?.issues
    ?? (error as { errors?: unknown } | null)?.errors

  if (!Array.isArray(candidateIssues)) {
    return [{
      path: '',
      message: stringifyUnknown((error as { message?: unknown } | null)?.message) || 'Props did not pass validation.',
    }]
  }

  return candidateIssues.map(normalizeIssue)
}

function unavailableValidation(): PropsValidationResult {
  return {
    status: 'unavailable',
    message: 'Schema validation is not configured.',
    issues: [],
  }
}

function validateProps(
  props: PropsRecord,
  schema: unknown,
): { ok: true; props: PropsRecord; result: PropsValidationResult } | { ok: false; result: PropsValidationResult } {
  if (!hasSafeParse(schema)) {
    return {
      ok: true,
      props,
      result: unavailableValidation(),
    }
  }

  let parsedResult: unknown
  try {
    parsedResult = schema.safeParse(props)
  } catch (err) {
    return {
      ok: false,
      result: {
        status: 'invalid',
        message: err instanceof Error ? err.message : 'Props did not pass validation.',
        issues: normalizeIssues(err),
      },
    }
  }

  if (parsedResult == null || typeof parsedResult !== 'object') {
    return {
      ok: false,
      result: {
        status: 'invalid',
        message: 'Props validation returned an unsupported result.',
        issues: [{ path: '', message: 'Props validation returned an unsupported result.' }],
      },
    }
  }

  const resultRecord = parsedResult as { success?: unknown; data?: unknown; error?: unknown }

  if (resultRecord.success === true) {
    if (!isPropsRecord(resultRecord.data)) {
      return {
        ok: false,
        result: {
          status: 'invalid',
          message: 'Validated props must be a JSON object.',
          issues: [{ path: '', message: 'Validated props must be a JSON object.' }],
        },
      }
    }

    return {
      ok: true,
      props: resultRecord.data,
      result: {
        status: 'valid',
        message: 'Props match the configured schema.',
        issues: [],
      },
    }
  }

  if (resultRecord.success !== false) {
    return {
      ok: false,
      result: {
        status: 'invalid',
        message: 'Props validation returned an unsupported result.',
        issues: [{ path: '', message: 'Props validation returned an unsupported result.' }],
      },
    }
  }

  return {
    ok: false,
    result: {
      status: 'invalid',
      message: 'Props did not pass validation.',
      issues: normalizeIssues(resultRecord.error),
    },
  }
}

function hasWrapper(config: MountLabConfig, key: string | null | undefined): key is string {
  return typeof key === 'string' && !!config.wrappers?.[key]
}

export function resolveWrapperSelection(
  config: MountLabConfig,
  componentCase: ComponentCase | null,
  explicitKey: string | null,
): WrapperResolution {
  if (hasWrapper(config, explicitKey)) {
    return {
      requestedKey: explicitKey,
      resolvedKey: explicitKey,
      missingKeys: [],
      fallbackReason: null,
    }
  }

  const missingKeys: string[] = []
  let fallbackReason: WrapperFallbackReason = null

  if (explicitKey) {
    missingKeys.push(explicitKey)
    fallbackReason = 'missing-explicit'
  } else if (componentCase?.wrapper && !hasWrapper(config, componentCase.wrapper)) {
    missingKeys.push(componentCase.wrapper)
    fallbackReason = 'missing-case'
  }

  const caseWrapper = componentCase?.wrapper
  if (hasWrapper(config, caseWrapper)) {
    return {
      requestedKey: explicitKey ?? caseWrapper ?? null,
      resolvedKey: caseWrapper,
      missingKeys,
      fallbackReason,
    }
  }

  if (hasWrapper(config, config.defaultWrapper)) {
    return {
      requestedKey: explicitKey ?? componentCase?.wrapper ?? config.defaultWrapper ?? null,
      resolvedKey: config.defaultWrapper,
      missingKeys,
      fallbackReason,
    }
  }

  if (config.defaultWrapper && !hasWrapper(config, config.defaultWrapper)) {
    missingKeys.push(config.defaultWrapper)
    fallbackReason ??= 'missing-default'
  }

  return {
    requestedKey: explicitKey ?? componentCase?.wrapper ?? config.defaultWrapper ?? null,
    resolvedKey: null,
    missingKeys,
    fallbackReason,
  }
}

function formatWrapperWarning(resolution: WrapperResolution): string | null {
  if (resolution.missingKeys.length === 0) return null

  const missing = resolution.missingKeys
    .map(key => `"${key}"`)
    .join(', ')

  if (resolution.resolvedKey) {
    return `Wrapper ${missing} is not configured. Using "${resolution.resolvedKey}" instead.`
  }

  return `Wrapper ${missing} is not configured. Using the built-in empty wrapper.`
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

  if (selection.viewportKey) url.searchParams.set('viewport', selection.viewportKey)
  else url.searchParams.delete('viewport')

  window.history.replaceState(window.history.state, '', url)
}

function formatViewportTitle(key: string): string {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || key
}

function getViewportOptions(config: MountLabConfig): ViewportOption[] {
  const configured = Object.entries(config.viewports ?? {}).map(([key, viewport]) => ({
    key,
    title: formatViewportTitle(key),
    viewport,
  }))

  if (configured.some(option => option.viewport === null)) {
    return configured
  }

  return [
    { key: 'auto', title: 'Auto', viewport: null },
    ...configured,
  ]
}

export function useWorkbenchState(cases: ComponentCase[], config: MountLabConfig) {
  const urlSelection = readUrlSelection()

  const selectedCaseId = ref<string | null>(urlSelection.caseId)
  const selectedVariantId = ref<string | null>(urlSelection.variantId)
  const selectedWrapperKey = ref<string | null>(urlSelection.wrapperKey)
  const explicitWrapperKey = ref<string | null>(urlSelection.wrapperKey)
  const selectedViewportKey = ref<string | null>(urlSelection.viewportKey)
  const currentProps = ref<PropsRecord>({})
  const propsJsonText = ref('{}')
  const propsJsonParseError = ref<string | null>(null)
  const propsValidationResult = ref<PropsValidationResult>(unavailableValidation())
  const eventLog = ref<EventLogEntry[]>([])
  const wrapperResolution = ref<WrapperResolution>({
    requestedKey: null,
    resolvedKey: null,
    missingKeys: [],
    fallbackReason: null,
  })
  let nextEventId = 1

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

  const wrapperWarning = computed<string | null>(() =>
    formatWrapperWarning(wrapperResolution.value),
  )

  const viewportOptions = computed<ViewportOption[]>(() => getViewportOptions(config))

  const selectedViewport = computed<Viewport | null>(() =>
    viewportOptions.value.find(option => option.key === selectedViewportKey.value)?.viewport ?? null,
  )

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

  function resolveViewportKey(candidate: string | null): string | null {
    const options = viewportOptions.value
    if (candidate && options.some(option => option.key === candidate)) return candidate

    return (
      options.find(option => option.key === 'auto')?.key
      ?? options.find(option => option.key === 'default')?.key
      ?? options[0]?.key
      ?? null
    )
  }

  function resetCurrentProps(): void {
    const nextProps = cloneProps(selectedVariant.value?.props)
    propsJsonText.value = formatPropsJson(nextProps)
    propsJsonParseError.value = null
    const validation = validateProps(nextProps, selectedCase.value?.propsSchema)
    propsValidationResult.value = validation.result
    if (validation.ok) {
      currentProps.value = cloneProps(validation.props)
      propsJsonText.value = formatPropsJson(currentProps.value)
    }
  }

  function clearEventLog(): void {
    eventLog.value = []
  }

  function updatePropsJsonText(value: string): void {
    propsJsonText.value = value
    propsJsonParseError.value = null

    let parsed: unknown
    try {
      parsed = JSON.parse(value)
    } catch (err) {
      propsJsonParseError.value = err instanceof Error ? err.message : 'Invalid JSON.'
      propsValidationResult.value = {
        status: 'invalid',
        message: 'Props JSON could not be parsed.',
        issues: [{ path: '', message: propsJsonParseError.value }],
      }
      return
    }

    if (!isPropsRecord(parsed)) {
      propsJsonParseError.value = 'Props JSON must be an object.'
      propsValidationResult.value = {
        status: 'invalid',
        message: 'Props JSON must be an object.',
        issues: [{ path: '', message: 'Props JSON must be an object.' }],
      }
      return
    }

    const validation = validateProps(parsed, selectedCase.value?.propsSchema)
    propsValidationResult.value = validation.result

    if (!validation.ok) {
      return
    }

    currentProps.value = cloneProps(validation.props)
  }

  async function copyPropsJson(): Promise<void> {
    if (
      typeof navigator === 'undefined'
      || typeof navigator.clipboard?.writeText !== 'function'
    ) {
      return
    }

    await navigator.clipboard.writeText(propsJsonText.value)
  }

  async function copyCurrentUrl(): Promise<void> {
    if (
      !canUseBrowserUrl()
      || typeof navigator === 'undefined'
      || typeof navigator.clipboard?.writeText !== 'function'
    ) {
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Copying is a convenience action; failure must not disrupt the workbench.
    }
  }

  function recordEvent(name: string, payload: unknown): void {
    eventLog.value = [
      {
        id: nextEventId++,
        name,
        timestamp: new Date().toLocaleTimeString(),
        payload,
      },
      ...eventLog.value,
    ]
  }

  function normalizeSelection(options: { resetProps: boolean }): void {
    const caseId = resolveCaseId(selectedCaseId.value)
    const componentCase = cases.find(c => c.id === caseId) ?? null
    const variantId = resolveVariantId(componentCase, selectedVariantId.value)
    const resolution = resolveWrapperSelection(config, componentCase, explicitWrapperKey.value)
    const wrapperKey = resolution.resolvedKey
    const viewportKey = resolveViewportKey(selectedViewportKey.value)

    selectedCaseId.value = caseId
    selectedVariantId.value = variantId
    selectedWrapperKey.value = wrapperKey
    selectedViewportKey.value = viewportKey
    wrapperResolution.value = resolution

    if (options.resetProps) {
      resetCurrentProps()
      clearEventLog()
    }

    writeUrlSelection({ caseId, variantId, wrapperKey, viewportKey })
  }

  function selectCase(caseId: string): void {
    selectedCaseId.value = caseId
    selectedVariantId.value = null
    explicitWrapperKey.value = null
    normalizeSelection({ resetProps: true })
  }

  function selectVariant(variantId: string): void {
    selectedVariantId.value = variantId
    normalizeSelection({ resetProps: true })
  }

  function selectWrapper(wrapperKey: string): void {
    explicitWrapperKey.value = wrapperKey
    normalizeSelection({ resetProps: false })
  }

  function selectViewport(viewportKey: string): void {
    selectedViewportKey.value = viewportKey
    normalizeSelection({ resetProps: false })
  }

  normalizeSelection({ resetProps: true })

  watch(
    () => [
      cases.map(c => `${c.id}:${c.variants.map(v => v.id).join(',')}`).join('|'),
      Object.keys(config.wrappers ?? {}).join('|'),
      config.defaultWrapper ?? '',
      Object.entries(config.viewports ?? {})
        .map(([key, viewport]) => `${key}:${viewport?.width ?? 'auto'}x${viewport?.height ?? 'auto'}`)
        .join('|'),
    ],
    () => normalizeSelection({ resetProps: true }),
  )

  return {
    selectedCaseId,
    selectedVariantId,
    selectedWrapperKey,
    selectedViewportKey,
    selectedCase,
    selectedVariant,
    wrapperComponent,
    wrapperWarning,
    viewportOptions,
    selectedViewport,
    currentProps,
    propsJsonText,
    propsJsonParseError,
    propsValidationResult,
    eventLog,
    selectCase,
    selectVariant,
    selectWrapper,
    selectViewport,
    updatePropsJsonText,
    resetCurrentProps,
    copyPropsJson,
    copyCurrentUrl,
    recordEvent,
    clearEventLog,
  }
}

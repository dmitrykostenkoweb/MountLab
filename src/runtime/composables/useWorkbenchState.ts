import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { ComponentCase, ComponentVariant, MountLabConfig, Viewport } from '../../core/types.js'

interface UrlSelection {
  caseId: string | null
  variantId: string | null
  wrapperKey: string | null
  viewportKey: string | null
  viewportWidth: string | null
  viewportHeight: string | null
}

type WrapperFallbackReason = 'missing-explicit' | 'missing-case' | 'missing-default' | null

type PropsRecord = Record<string, unknown>
type PropFieldKind = 'string' | 'number' | 'boolean' | 'json'
type RuntimePropConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | FunctionConstructor

export interface PropEditorField {
  key: string
  kind: PropFieldKind
  value: unknown
  draftText: string
  error: string | null
}

export type PropFieldEdit =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'json'; value: string }

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

const CUSTOM_VIEWPORT_KEY = 'custom'
const DEFAULT_CUSTOM_VIEWPORT: Viewport = { width: 1280, height: 800 }
const MIN_VIEWPORT_WIDTH = 100
const MIN_VIEWPORT_HEIGHT = 100
const MAX_VIEWPORT_WIDTH = 7680
const MAX_VIEWPORT_HEIGHT = 4320

function canUseBrowserUrl(): boolean {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined'
}

function readUrlSelection(): UrlSelection {
  if (!canUseBrowserUrl()) {
    return {
      caseId: null,
      variantId: null,
      wrapperKey: null,
      viewportKey: null,
      viewportWidth: null,
      viewportHeight: null,
    }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    caseId: params.get('case'),
    variantId: params.get('variant'),
    wrapperKey: params.get('wrapper'),
    viewportKey: params.get('viewport'),
    viewportWidth: params.get('viewportWidth'),
    viewportHeight: params.get('viewportHeight'),
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

function hasOwnKeys(value: PropsRecord): boolean {
  return Object.keys(value).length > 0
}

function isPropConstructor(value: unknown): value is RuntimePropConstructor {
  return (
    value === String
    || value === Number
    || value === Boolean
    || value === Array
    || value === Object
  )
}

function getPropOptionType(option: unknown): unknown {
  if (isPropConstructor(option) || Array.isArray(option)) return option
  if (option != null && typeof option === 'object' && 'type' in option) {
    return (option as { type?: unknown }).type
  }
  return null
}

function propOptionIncludesType(option: unknown, type: RuntimePropConstructor): boolean {
  const optionType = getPropOptionType(option)
  if (Array.isArray(optionType)) return optionType.includes(type)
  return optionType === type
}

function getPropDefaultValue(option: unknown): unknown {
  if (option == null || typeof option !== 'object' || !('default' in option)) {
    return undefined
  }

  const defaultValue = (option as { default?: unknown }).default
  if (typeof defaultValue === 'function' && !propOptionIncludesType(option, Function)) {
    try {
      return defaultValue()
    } catch {
      return undefined
    }
  }

  return defaultValue
}

function getPlaceholderPropValue(option: unknown): unknown {
  if (propOptionIncludesType(option, String)) return ''
  if (propOptionIncludesType(option, Number)) return 0
  if (propOptionIncludesType(option, Boolean)) return false
  if (propOptionIncludesType(option, Array)) return []
  if (propOptionIncludesType(option, Object)) return {}
  return null
}

function derivePropsFromComponent(component: Component | null | undefined): PropsRecord {
  const runtimeProps = (component as { props?: unknown } | null | undefined)?.props
  const props: PropsRecord = {}

  if (Array.isArray(runtimeProps)) {
    for (const key of runtimeProps) {
      if (typeof key === 'string' && key) {
        props[key] = null
      }
    }
    return props
  }

  if (runtimeProps == null || typeof runtimeProps !== 'object') {
    return props
  }

  for (const [key, option] of Object.entries(runtimeProps)) {
    const defaultValue = getPropDefaultValue(option)
    props[key] = defaultValue === undefined
      ? getPlaceholderPropValue(option)
      : defaultValue
  }

  return cloneProps(props)
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

function formatFieldJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return stringifyUnknown(value)
  }
}

function getPropFieldKind(value: unknown): PropFieldKind {
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'json'
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

  if (
    selection.viewportKey === CUSTOM_VIEWPORT_KEY
    && selection.viewportWidth
    && selection.viewportHeight
  ) {
    url.searchParams.set('viewportWidth', selection.viewportWidth)
    url.searchParams.set('viewportHeight', selection.viewportHeight)
  } else {
    url.searchParams.delete('viewportWidth')
    url.searchParams.delete('viewportHeight')
  }

  window.history.replaceState(window.history.state, '', url)
}

function formatViewportTitle(key: string): string {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || key
}

function parseViewportDimension(value: unknown): number | null {
  if (typeof value === 'string' && value.trim() === '') return null

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null

  return Math.round(parsed)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function normalizeViewportDimensions(
  width: unknown,
  height: unknown,
): Viewport | null {
  const parsedWidth = parseViewportDimension(width)
  const parsedHeight = parseViewportDimension(height)

  if (parsedWidth == null || parsedHeight == null) {
    return null
  }

  return {
    width: clamp(parsedWidth, MIN_VIEWPORT_WIDTH, MAX_VIEWPORT_WIDTH),
    height: clamp(parsedHeight, MIN_VIEWPORT_HEIGHT, MAX_VIEWPORT_HEIGHT),
  }
}

function getViewportOptions(config: MountLabConfig, customViewport: Viewport): ViewportOption[] {
  const configured = Object.entries(config.viewports ?? {})
    .filter(([key]) => key !== CUSTOM_VIEWPORT_KEY)
    .map(([key, viewport]) => ({
    key,
    title: formatViewportTitle(key),
    viewport,
  }))

  const options = configured.some(option => option.viewport === null)
    ? configured
    : [
        { key: 'auto', title: 'Auto', viewport: null },
        ...configured,
      ]

  return [
    ...options,
    { key: CUSTOM_VIEWPORT_KEY, title: 'Custom', viewport: customViewport },
  ]
}

export function useWorkbenchState(cases: ComponentCase[], config: MountLabConfig) {
  const urlSelection = readUrlSelection()

  const selectedCaseId = ref<string | null>(urlSelection.caseId)
  const selectedVariantId = ref<string | null>(urlSelection.variantId)
  const selectedWrapperKey = ref<string | null>(urlSelection.wrapperKey)
  const explicitWrapperKey = ref<string | null>(urlSelection.wrapperKey)
  const selectedViewportKey = ref<string | null>(urlSelection.viewportKey)
  const initialCustomViewport = normalizeViewportDimensions(
    urlSelection.viewportWidth,
    urlSelection.viewportHeight,
  )
  const canSelectCustomViewport = ref(
    urlSelection.viewportKey !== CUSTOM_VIEWPORT_KEY || initialCustomViewport != null,
  )
  const customViewport = ref<Viewport>(initialCustomViewport ?? DEFAULT_CUSTOM_VIEWPORT)
  const currentProps = ref<PropsRecord>({})
  const propsJsonText = ref('{}')
  const propsJsonParseError = ref<string | null>(null)
  const propFieldDrafts = ref<Record<string, string>>({})
  const propFieldErrors = ref<Record<string, string>>({})
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

  const viewportOptions = computed<ViewportOption[]>(() => getViewportOptions(config, customViewport.value))

  const selectedViewport = computed<Viewport | null>(() =>
    viewportOptions.value.find(option => option.key === selectedViewportKey.value)?.viewport ?? null,
  )

  const editableViewport = computed<Viewport>(() =>
    selectedViewport.value ?? customViewport.value ?? DEFAULT_CUSTOM_VIEWPORT,
  )

  const propFields = computed<PropEditorField[]>(() =>
    Object.entries(currentProps.value).map(([key, value]) => {
      const kind = getPropFieldKind(value)
      const fallbackDraft = kind === 'json' ? formatFieldJson(value) : String(value)

      return {
        key,
        kind,
        value,
        draftText: propFieldDrafts.value[key] ?? fallbackDraft,
        error: propFieldErrors.value[key] ?? null,
      }
    }),
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
    if (candidate === CUSTOM_VIEWPORT_KEY) {
      return canSelectCustomViewport.value ? CUSTOM_VIEWPORT_KEY : resolveViewportKey(null)
    }

    const options = viewportOptions.value
    if (
      candidate
      && candidate !== CUSTOM_VIEWPORT_KEY
      && options.some(option => option.key === candidate)
    ) {
      return candidate
    }

    return (
      options.find(option => option.key === 'auto')?.key
      ?? options.find(option => option.key === 'default')?.key
      ?? options[0]?.key
      ?? null
    )
  }

  function resetCurrentProps(): void {
    const variantProps = cloneProps(selectedVariant.value?.props)
    const nextProps = hasOwnKeys(variantProps)
      ? variantProps
      : derivePropsFromComponent(selectedCase.value?.component)
    propsJsonText.value = formatPropsJson(nextProps)
    propsJsonParseError.value = null
    propFieldDrafts.value = {}
    propFieldErrors.value = {}
    const validation = validateProps(nextProps, selectedCase.value?.propsSchema)
    propsValidationResult.value = validation.result
    if (validation.ok) {
      currentProps.value = cloneProps(validation.props)
      propsJsonText.value = formatPropsJson(currentProps.value)
    }
  }

  function commitPropsField(
    key: string,
    rawDraft: string | null,
    nextValue: unknown,
  ): void {
    const nextProps = cloneProps(currentProps.value)
    nextProps[key] = nextValue

    const validation = validateProps(nextProps, selectedCase.value?.propsSchema)
    propsValidationResult.value = validation.result

    if (!validation.ok) {
      propFieldDrafts.value = rawDraft == null
        ? propFieldDrafts.value
        : { ...propFieldDrafts.value, [key]: rawDraft }
      propFieldErrors.value = {
        ...propFieldErrors.value,
        [key]: validation.result.message,
      }
      return
    }

    const nextDrafts = { ...propFieldDrafts.value }
    const nextErrors = { ...propFieldErrors.value }
    delete nextDrafts[key]
    delete nextErrors[key]

    currentProps.value = cloneProps(validation.props)
    propsJsonText.value = formatPropsJson(currentProps.value)
    propsJsonParseError.value = null
    propFieldDrafts.value = nextDrafts
    propFieldErrors.value = nextErrors
  }

  function updatePropField(key: string, edit: PropFieldEdit): void {
    if (!Object.prototype.hasOwnProperty.call(currentProps.value, key)) return

    if (edit.kind === 'string') {
      commitPropsField(key, edit.value, edit.value)
      return
    }

    if (edit.kind === 'boolean') {
      commitPropsField(key, null, edit.value)
      return
    }

    if (edit.kind === 'number') {
      const trimmed = edit.value.trim()
      const parsed = Number(trimmed)

      if (trimmed === '' || !Number.isFinite(parsed)) {
        propFieldDrafts.value = { ...propFieldDrafts.value, [key]: edit.value }
        propFieldErrors.value = {
          ...propFieldErrors.value,
          [key]: 'Enter a finite number.',
        }
        propsValidationResult.value = {
          status: 'invalid',
          message: 'Prop field value is invalid.',
          issues: [{ path: key, message: 'Enter a finite number.' }],
        }
        return
      }

      commitPropsField(key, edit.value, parsed)
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(edit.value)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON.'
      propFieldDrafts.value = { ...propFieldDrafts.value, [key]: edit.value }
      propFieldErrors.value = { ...propFieldErrors.value, [key]: message }
      propsValidationResult.value = {
        status: 'invalid',
        message: 'Prop field JSON could not be parsed.',
        issues: [{ path: key, message }],
      }
      return
    }

    commitPropsField(key, edit.value, parsed)
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
    propFieldDrafts.value = {}
    propFieldErrors.value = {}
  }

  async function copyPropsJson(): Promise<void> {
    if (
      typeof navigator === 'undefined'
      || typeof navigator.clipboard?.writeText !== 'function'
    ) {
      return
    }

    await navigator.clipboard.writeText(formatPropsJson(currentProps.value))
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

    writeUrlSelection({
      caseId,
      variantId,
      wrapperKey,
      viewportKey,
      viewportWidth: viewportKey === CUSTOM_VIEWPORT_KEY ? String(customViewport.value.width) : null,
      viewportHeight: viewportKey === CUSTOM_VIEWPORT_KEY ? String(customViewport.value.height) : null,
    })
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
    if (viewportKey === CUSTOM_VIEWPORT_KEY) {
      canSelectCustomViewport.value = true
    }

    selectedViewportKey.value = viewportKey
    normalizeSelection({ resetProps: false })
  }

  function setCustomViewportDimensions(dimensions: Partial<Viewport>): void {
    const nextViewport = normalizeViewportDimensions(
      dimensions.width ?? editableViewport.value.width,
      dimensions.height ?? editableViewport.value.height,
    )

    if (!nextViewport) return

    canSelectCustomViewport.value = true
    customViewport.value = nextViewport
    selectedViewportKey.value = CUSTOM_VIEWPORT_KEY
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
      `${customViewport.value.width}x${customViewport.value.height}`,
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
    editableViewport,
    customViewport,
    currentProps,
    propFields,
    propsJsonText,
    propsJsonParseError,
    propsValidationResult,
    eventLog,
    selectCase,
    selectVariant,
    selectWrapper,
    selectViewport,
    setCustomViewportDimensions,
    updatePropField,
    updatePropsJsonText,
    resetCurrentProps,
    copyPropsJson,
    copyCurrentUrl,
    recordEvent,
    clearEventLog,
  }
}

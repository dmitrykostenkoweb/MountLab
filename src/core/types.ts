import type { App, Component } from 'vue'

export interface MountLabConfig {
  /**
   * Port for the MountLab dev server.
   * @default 4300
   */
  port?: number

  /**
   * Glob patterns for auto-discovery of *.case.ts files.
   * @default ['src/**\/*.case.ts']
   */
  cases?: string[]

  /**
   * Glob patterns for auto-discovery of Vue component files.
   * Components without an authored sidecar *.case.ts file get a minimal
   * synthetic case with a default variant.
   */
  components?: string[]

  /**
   * Called with the Vue app instance before mounting.
   * Use this to install plugins: Pinia, PrimeVue, i18n, etc.
   */
  setupApp?: (app: App) => void | Promise<void>

  /**
   * Named wrapper components available in the workbench.
   * Keys are referenced by `wrapper` field in ComponentCase.
   */
  wrappers?: Record<string, Component>

  /**
   * Key of the wrapper used when a case does not specify one.
   */
  defaultWrapper?: string

  /**
   * Named viewport presets shown in the topbar.
   * Use `null` for the special "auto" (unconstrained) preset.
   */
  viewports?: Record<string, Viewport | null>
}

export interface ComponentCase<TProps = Record<string, unknown>> {
  /** Stable identifier, used in URL state (e.g. "product-card"). */
  id: string

  /** Human-readable label shown in the sidebar. */
  title?: string

  /** Sidebar group. Falls back to folder path when omitted. */
  group?: string

  component: Component

  /** Key of the wrapper to use. Falls back to `defaultWrapper`. */
  wrapper?: string

  /**
   * Optional Zod/Valibot schema for runtime props validation.
   * MountLab validates the props editor JSON against this schema.
   */
  propsSchema?: unknown

  variants: ComponentVariant<TProps>[]

  /**
   * Event names to capture and display in the event logger.
   * @example ['click', 'submit', 'update:modelValue']
   */
  events?: string[]

  /** Notes displayed below the component title in the right panel. */
  notes?: string
}

export interface ComponentVariant<TProps = Record<string, unknown>> {
  /** Stable identifier, used in URL state (e.g. "long-name"). */
  id: string

  /** Human-readable label shown in the variant selector. */
  title?: string

  /** Props passed to the component for this variant. */
  props?: TProps

  /** Notes displayed when this variant is active. */
  notes?: string
}

export interface Viewport {
  width: number
  height: number
}

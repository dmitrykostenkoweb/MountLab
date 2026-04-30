import type { Plugin } from 'vite'
import type { MountLabConfig } from '../core/types.js'

const VIRTUAL_CASES = 'virtual:mountlab/cases'
const VIRTUAL_CONFIG = 'virtual:mountlab/config'
const RESOLVED_CASES = '\0' + VIRTUAL_CASES
const RESOLVED_CONFIG = '\0' + VIRTUAL_CONFIG

/**
 * Vite plugin for MountLab.
 *
 * In a future phase this plugin will:
 * - Serve the runtime UI at /__mountlab/
 * - Expose virtual:mountlab/cases — a dynamic import list of all resolved
 *   *.case.ts files so the runtime Vue app can discover them
 * - Expose virtual:mountlab/config — serialized MountLab config for the runtime
 * - Handle HMR invalidation when case files are added/removed/changed
 */
export function mountlab(config: MountLabConfig = {}): Plugin {
  return {
    name: 'mountlab',
    configResolved(_resolvedConfig) {
      // Future: store resolved Vite config for merging with MountLab server config
    },
    configureServer(_server) {
      // Future: inject middleware to serve the runtime UI at /__mountlab/
    },
    resolveId(id) {
      if (id === VIRTUAL_CASES) return RESOLVED_CASES
      if (id === VIRTUAL_CONFIG) return RESOLVED_CONFIG
    },
    load(id) {
      if (id === RESOLVED_CASES) {
        // Future: glob config.cases patterns and generate dynamic imports
        return `export const cases = []`
      }
      if (id === RESOLVED_CONFIG) {
        // Future: serialize safe (non-Component) config fields for the runtime
        return `export const config = ${JSON.stringify({ port: config.port ?? 4300 })}`
      }
    },
  }
}

export type { MountLabConfig }

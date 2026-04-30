// Main package entrypoint — re-exports the public API.
// Users typically import from '@mountlab/vue' (this file) or from
// '@mountlab/vue/plugin' for the Vite plugin specifically.

export { defineMountLabConfig, defineComponentCase } from './core/index.js'
export type { MountLabConfig, ComponentCase, ComponentVariant, Viewport } from './core/index.js'

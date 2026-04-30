## Why

`mountlab dev` is currently a stub. Phases 4–6 of the PRD — Vite dev server, case
discovery, and the workbench UI — have not been implemented. This change delivers
the full runtime integration: a working `mountlab dev` command that starts a Vite
server, discovers cases, and renders the workbench.

## What Changes

- `mountlab dev` starts a real Vite dev server on the configured port (default 4300)
- The Vite plugin serves virtual HTML at `GET /` via `configureServer` middleware
- A virtual entry module (`/__mountlab/entry.js`) bootstraps the Vue workbench app
- `virtual:mountlab/cases` is generated from glob discovery of `*.case.ts` files
- The workbench runtime (`src/runtime/`) is built as a separate Vite output target
- Vue is treated as a peer dependency — externalized from the runtime build
- `setupApp(app)` from `mountlab.config.ts` runs once on the single Vue app instance
- Component preview is inline (same DOM, same Vue app) — no iframe
- Config and case changes trigger full page reload (no fine-grained HMR in MVP)
- The package build gains a second target: `build:runtime` (Vite SFC compilation)

## Capabilities

### New Capabilities

- `dev-server`: `mountlab dev` command — starts Vite, loads configs, serves workbench
- `case-discovery`: glob-based `*.case.ts` discovery, virtual case registry, file watcher
- `workbench-runtime`: Vue 3 workbench UI — sidebar, preview area, variant selector, wrapper selector
- `virtual-entry`: plugin-generated bootstrap module that wires cases, config, and the Vue app

### Modified Capabilities

- `vite-plugin-virtual-modules`: virtual module stubs become real implementations (`virtual:mountlab/cases`, `virtual:mountlab/config`, `/__mountlab/entry.js`)

## Impact

- `src/cli/commands/dev.ts` — implement fully (currently a stub)
- `src/plugin/index.ts` — implement `configureServer`, `resolveId`/`load` for all virtual modules, file watcher
- `src/runtime/` — new Vue SFC components (WorkbenchApp, Sidebar, PreviewArea, RightPanel, TopBar)
- `package.json` — add `build:runtime` script; add `@vitejs/plugin-vue` as dev dep; Vue as peerDep
- `tsup.config.ts` — no change (handles non-Vue layers only)
- New `vite.runtime.config.ts` — Vite build config for the runtime Vue app
- `dist/runtime/` — new build output served by the plugin

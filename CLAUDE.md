# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build         # full build: tsup (lib + CLI) + vite (runtime UI)
npm run build:lib     # tsup only — compiles src/ to dist/ (lib + CLI binary)
npm run build:runtime # vite only — compiles runtime Vue UI to dist/runtime/
npm run dev           # tsup --watch (no runtime hot-reload)
npm run playground    # build + run the local example app in examples/playground/
npm run test          # vitest run
npm run typecheck     # tsc --noEmit
```

## Architecture

MountLab is a component workbench for Vue 3 + Vite. It lets developers mount and iterate on individual components in isolation while preserving the host app's full plugin/alias/style context.

### Four-layer structure

| Layer | Path | Role |
|---|---|---|
| **Core** | `src/core/` | Public types & `define*` helpers exported to user projects |
| **CLI** | `src/cli/` | `mountlab` binary — `init`, `add`, `dev` commands via Commander.js |
| **Plugin** | `src/plugin/` | Vite plugin: virtual modules, case discovery, HMR |
| **Runtime** | `src/runtime/` | Vue 3 workbench UI rendered inside the user's Vite dev server |

### Virtual modules (plugin ↔ runtime contract)

The Vite plugin exposes two virtual modules consumed by the runtime:

- `virtual:mountlab/cases` — auto-discovered `.case.ts` files
- `virtual:mountlab/config` — user's `mountlab.config.ts`

The workbench is injected via `/__mountlab/entry.js`.

### Runtime UI layout

`WorkbenchApp.vue` is the root. Four panels:

- **Sidebar** — component/case tree selector
- **TopBar** — variant switcher, viewport selector
- **PreviewArea** — live component preview + event logger overlay
- **RightPanel** — JSON props editor, event log, notes

State is managed in `src/runtime/composables/useWorkbenchState.ts` and synced to the URL.

Two utility modules keep component files thin:

- `src/runtime/caseMetadata.ts` — pure functions for sidebar grouping, fallback group derivation from file path, search text normalisation, and filtering
- `src/runtime/viewportResize.ts` — pure drag-math for custom viewport resizing (`ViewportResizeAxis`, `calculateResizedViewport`)

### Build outputs

`tsup.config.ts` produces two separate entry points:
1. Library (`src/index.ts` → `dist/index.js`) — the npm package API
2. CLI (`src/cli/index.ts` → `dist/cli/index.js`) — Node binary with `#!/usr/bin/env node` shebang

`vite.runtime.config.ts` builds the workbench UI as an ESM library, externalising `vue` and all `virtual:mountlab/*` modules.

### Package exports

```json
"."        → core API (defineComponentCase, defineMountLabConfig, types)
"./core"   → types only
"./plugin" → Vite plugin
"./runtime"→ workbench Vue app component
```

### Case files

Users create `.case.ts` files alongside their components using `defineComponentCase()`. The CLI `add` command scaffolds these. The Vite plugin discovers them via fast-glob at dev-server startup.

## Local example app

`examples/playground/` is a minimal Vue 3 + Vite app that consumes the built package via `file:../..`. Run it with:

```bash
npm run playground   # build + npm install in examples/playground + mountlab dev --open
```

It lives under `examples/playground/src/` with components and case files for manual end-to-end testing.

## OpenSpec workflow

Changes are tracked under `openspec/`. Use the `opsx:*` skills to create, implement, verify, and archive changes.

Active changes live in `openspec/changes/<change-name>/` (proposal, design, specs, tasks). Archived changes are under `openspec/changes/archive/`.

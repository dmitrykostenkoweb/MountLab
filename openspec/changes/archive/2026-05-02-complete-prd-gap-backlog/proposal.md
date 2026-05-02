## Why

MountLab already covers most of the PRD MVP workflow, but several PRD and accepted-spec gaps remain: sidebar search/folder grouping, viewport controls, share/copy affordances, package metadata polish, current documentation accuracy, and broader verification coverage. Closing these gaps makes the current implementation match the documented product surface more closely before the project moves from early skeleton language toward a usable MVP.

## What Changes

- Add sidebar search for discovered cases by title, id, group, and source path when available.
- Replace the current hardcoded `"Components"` fallback grouping with folder/path-derived grouping when a case has no explicit `group`.
- Add viewport preset support in the runtime UI using `MountLabConfig.viewports`, including an unconstrained/auto preset.
- Add a copy-current-preview-URL action for the active case/variant/wrapper selection.
- Add `mountlab dev --open` to open the workbench URL after the server starts.
- Update README and quick-start documentation so it reflects the implemented CLI/runtime workflow instead of the older Phase 1 skeleton status.
- Add missing package peer dependency metadata so Vue and Vite are treated as optional peers where intended.
- Broaden verification around CLI behavior, virtual case discovery, runtime URL state, props editor/validation, event logging, and a minimal real-app smoke path.
- No breaking changes are intended.

## Capabilities

### New Capabilities

- `runtime-sidebar-navigation`: Sidebar case grouping, source-path-aware metadata, and case search behavior.
- `runtime-viewport-controls`: Runtime viewport preset selection and preview sizing behavior.
- `documentation-quickstart`: User-facing quick-start and current capability documentation for the package.

### Modified Capabilities

- `cli-structure`: Add the `dev --open` option to the existing CLI command contract.
- `core-types`: Clarify how `viewports` is consumed by the runtime, not only typed in config.
- `runtime-state-url-sync`: Add share/copy URL behavior that uses the existing case/variant/wrapper URL state.
- `vite-plugin-virtual-modules`: Expose enough discovered-case metadata for sidebar path fallback/search without weakening case validation.
- `package-structure`: Add optional peer dependency metadata for Vue and Vite.
- `development-verification`: Expand required verification beyond typecheck/build to cover the remaining PRD-critical workflows.

## Impact

- Affects runtime components under `src/runtime/`, especially `Sidebar.vue`, `TopBar.vue`, `PreviewArea.vue`, and `useWorkbenchState.ts`.
- May affect the Vite plugin generated case registry if source paths need to be exposed to runtime UI safely.
- Affects CLI command registration and `runDev` behavior for `--open`.
- Affects package metadata in `package.json`.
- Affects README and possibly adds a small example/smoke fixture or test harness.
- Requires new or expanded tests for CLI commands, plugin discovery, runtime state, right-panel behavior, and viewport/sidebar interactions.

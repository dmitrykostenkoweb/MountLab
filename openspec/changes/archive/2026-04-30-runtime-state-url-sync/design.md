## Context

The runtime workbench currently owns selection state directly in `WorkbenchApp.vue`: `selectedCaseId`, `selectedVariantId`, and `selectedWrapperKey` are local refs, derived values are computed inline, and `PreviewArea` receives the selected variant instead of an explicit props object. There is no shared model for current props, no URL restoration, and no reusable state boundary for later props editor, validation, or event logger work.

The change should stay runtime-only. It must not alter CLI behavior, Vite plugin case discovery, generated case files, or the public `@mountlab/vue` API.

## Goals / Non-Goals

**Goals:**

- Create one authoritative runtime state model for case, variant, wrapper, and current props.
- Initialize state from `window.location.search` using `case`, `variant`, and `wrapper`.
- Normalize missing or invalid URL params to valid runtime selections.
- Keep URL params synchronized after user selection changes.
- Reset `currentProps` to a cloned copy of selected variant props when case or variant changes.
- Pass explicit `currentProps` into preview so later props editor work can update preview without changing selected variant data.
- Keep existing sidebar, topbar, and preview behavior intact from the user's perspective.

**Non-Goals:**

- No JSON props editor UI.
- No Zod validation behavior.
- No event logger.
- No new wrapper warning UI beyond selecting a valid/fallback wrapper.
- No browser history stack for every selection change.
- No persisted local storage state.

## Decisions

### Add a runtime state composable

Create a small runtime composable/helper, for example `src/runtime/composables/useWorkbenchState.ts`, and move selection normalization there.

Rationale: `WorkbenchApp.vue` should orchestrate layout, not contain every state rule. A composable gives later features a stable place to add editable props, validation status, and event handling without expanding the root component.

Alternative considered: keep everything inline in `WorkbenchApp.vue`. That is faster initially, but it makes the upcoming props editor and validation work harder because reset and URL behavior would be coupled to template wiring.

### Store IDs as canonical refs and derive selected objects

The state model should keep `selectedCaseId`, `selectedVariantId`, and `selectedWrapperKey` as refs, then derive `selectedCase`, `selectedVariant`, `wrapperComponent`, and fallback keys from the current cases/config.

Rationale: URL params and UI controls operate on stable string identifiers. Derived objects avoid stale references when case modules reload.

Alternative considered: store selected case/variant objects directly. That is convenient for rendering, but it is fragile with HMR and URL sync because object identity can change while IDs remain stable.

### Normalize selection through explicit fallback functions

The composable should centralize fallback rules:

- Case: use URL `case` when it matches a discovered case; otherwise use the first discovered case; otherwise `null`.
- Variant: use URL/current selected variant when it belongs to the selected case; otherwise use the selected case's first variant; otherwise `null`.
- Wrapper: use URL/current wrapper when it exists in `config.wrappers`; otherwise use the case wrapper if valid; otherwise use `config.defaultWrapper` if valid; otherwise `null`.

Rationale: fallback behavior must be predictable and testable. It also prevents invalid URL params from leaking into UI controls.

Alternative considered: let each component apply its own fallback. That duplicates logic between `WorkbenchApp`, `TopBar`, and `PreviewArea` and makes invalid URL behavior inconsistent.

### Clone variant props into current props

`currentProps` should be a cloned copy of `selectedVariant.props ?? {}`. When the selected case or variant changes, the composable resets `currentProps` to a fresh clone. `PreviewArea` should render with `currentProps`, not directly with `selectedVariant.props`.

Rationale: the upcoming props editor needs editable state that does not mutate the case definition or selected variant fixture. Cloning also keeps reset semantics simple.

Use a pragmatic clone strategy for JSON-like fixture props. `structuredClone` is preferred when available; fallback to JSON serialization is acceptable for MVP fixture data.

Alternative considered: pass variant props directly until the props editor exists. That preserves current behavior but would require revisiting preview wiring immediately in the next change.

### Synchronize URL with replaceState

State changes should update query params using `window.history.replaceState`, not `pushState`.

Rationale: switching components and variants in a workbench is frequent. `replaceState` keeps the URL shareable without filling the browser back stack with every selection.

Alternative considered: `pushState` for each selection. This gives finer navigation history, but it makes routine workbench usage noisy and is outside MVP requirements.

### Keep URL sync browser-only and defensive

The runtime runs in the browser, but helpers should still guard access to `window` so build/typecheck and any future non-browser tests do not fail.

Rationale: the runtime build can evaluate module setup in browser-like assumptions today, but defensive access keeps the composable easier to test and safer to reuse.

Alternative considered: direct `window` access in setup. This is simpler but less robust.

## Risks / Trade-offs

- Invalid wrapper fallback may hide that a case references a missing wrapper -> later right-panel or warning UI should surface this explicitly.
- JSON fallback cloning cannot preserve functions, dates, maps, or class instances -> acceptable for MVP fixture props, and `structuredClone` handles more cases where available.
- URL sync can trigger watchers during initial normalization -> guard with a single initialization flow and only write normalized params after state is valid.
- HMR case registry updates can invalidate selected IDs -> normalization should run when the cases array changes and fallback to valid selections.

## Migration Plan

1. Add the runtime state composable/helper.
2. Refactor `WorkbenchApp.vue` to use the composable.
3. Change `PreviewArea.vue` to receive and render `currentProps`.
4. Keep existing `TopBar` and `Sidebar` props/events compatible where possible.
5. Run `npm run typecheck` and `npm run build`.

Rollback is straightforward: revert the runtime composable and restore the previous inline refs/computed values in `WorkbenchApp.vue`.

## Open Questions

- Should the URL omit params that match defaults, or always include normalized `case`, `variant`, and `wrapper` when available?
- Should `popstate` be handled now so browser Back/Forward restores prior selections, or should that wait until URL behavior is expanded?

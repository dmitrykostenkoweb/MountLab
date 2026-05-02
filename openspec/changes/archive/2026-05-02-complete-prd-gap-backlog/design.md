## Context

The current implementation already has the main MountLab runtime shape: `WorkbenchApp.vue` wires sidebar, topbar, preview, and right panel through `useWorkbenchState`; the Vite plugin discovers `*.case.ts` files and validates basic case objects; CLI commands cover `init`, `add`, and `dev`.

The remaining PRD gaps are cross-cutting. Sidebar search and folder fallback need source-path metadata from case discovery. Viewport presets affect config types, topbar controls, preview sizing, and URL/share state. `dev --open`, package metadata, docs, and verification touch CLI/package surfaces outside the runtime. The design should preserve the existing public case authoring API and avoid making users add new fields to case files.

## Goals / Non-Goals

**Goals:**

- Add source-path-aware sidebar grouping and search without changing the required `ComponentCase` authoring shape.
- Add runtime viewport preset selection based on `MountLabConfig.viewports`, including a default unconstrained mode.
- Keep the existing case/variant/wrapper URL contract and extend it only where useful for viewport/share behavior.
- Add a small `mountlab dev --open` option without changing default dev server startup.
- Bring package metadata and README in line with the current implemented workflow.
- Expand tests around the workflows that currently have little or no coverage.

**Non-Goals:**

- No static build/publish mode.
- No visual regression, screenshot, or Playwright export features.
- No saved edited props/new variant file-writing endpoint.
- No TypeScript-to-schema or generated fixture support.
- No change to the public `defineComponentCase` minimum required fields.

## Decisions

### Keep discovered-case metadata separate from authored case fields

The Vite plugin should continue validating and exporting the authored case object, but it should also expose runtime-only metadata for each discovered case, especially the diagnostic/source path. The runtime can use that metadata for sidebar search and fallback grouping.

Recommended shape:

```ts
interface RuntimeCaseEntry {
  case: ComponentCase
  path: string
}
```

The runtime may still receive a flat `cases` array for compatibility, but sidebar-facing code should have access to entries or a lookup by case id.

Rationale: source paths are discovered by the plugin, not authored by users. Putting `path` directly into `ComponentCase` would blur public API with internal discovery metadata and require users to understand a field they should not manage.

Alternative considered: infer grouping only from `case.group` and keep paths private. That cannot satisfy PRD search by path or folder fallback.

### Derive sidebar fallback groups from normalized relative paths

When `case.group` is present, use it exactly. When it is missing, derive a group from the source path:

- Prefer the parent folder under `src/` when available, for example `src/components/product-card/ProductCard.case.ts` -> `components/product-card`.
- Fall back to the immediate parent folder for files outside `src/`.
- Fall back to `"Components"` only when no useful path is available.

Search should match case title, id, explicit/fallback group, and path using case-insensitive substring matching.

Rationale: this keeps the default sidebar useful in larger projects without forcing explicit `group` on every case.

Alternative considered: derive only the first folder segment. That is simpler, but less useful when many components live below broad folders like `src/components`.

### Treat viewport as runtime selection state

Add selected viewport key to `useWorkbenchState`, with default selection:

1. URL `viewport` param if it matches configured viewports.
2. A configured `auto`/`default` key if present.
3. Built-in auto/unconstrained mode.

`config.viewports` values map keys to `{ width, height }` or `null`; `null` means unconstrained. `PreviewArea` should receive the resolved viewport and apply size constraints to a preview canvas/container, while preserving normal scrolling inside the preview region.

Rationale: viewport selection belongs beside case/variant/wrapper because it changes what the developer is inspecting and should be shareable.

Alternative considered: keep viewport state local to `TopBar`. That makes the UI easier to add, but it prevents URL restore and copy-current-URL from reflecting the actual preview state.

### Extend URL state carefully

Keep existing `case`, `variant`, and `wrapper` params. Add `viewport` only when a configured or built-in viewport key is selected. Invalid viewport params should fall back gracefully, matching existing case/variant/wrapper behavior.

Copy-current-preview-URL should write the current `window.location.href` after state normalization to the clipboard. It should not mutate runtime selection state.

Rationale: this extends the current shareable URL model without introducing a new route format.

Alternative considered: omit viewport from URL. That would make copy URL less accurate for viewport-specific review.

### Implement `dev --open` as a CLI option, not config

Add `--open` to `mountlab dev` and pass it to `runDev`. After the Vite server starts and the final local URL is known, open that URL with a small Node helper using platform commands (`open`, `cmd /c start`, or `xdg-open`) or Vite's existing open behavior if it fits the current merged config cleanly.

Rationale: opening the browser is a per-invocation convenience. It should not require editing `mountlab.config.ts`.

Alternative considered: add `open` to `MountLabConfig`. That adds persistent behavior and config surface for a minor dev convenience.

### Keep documentation update factual and current

README should describe the current working flow, supported MVP features, and known limitations. It should remove the stale "Phase 1 skeleton" status and avoid documenting roadmap items as implemented.

Rationale: the README is currently misleading for users evaluating the package.

Alternative considered: defer docs until all PRD gaps are implemented. That keeps docs stale during exactly the period when users need clarity.

### Expand verification in layers

Add focused tests close to each behavior:

- CLI tests for `dev --open` option wiring and existing command options.
- Plugin tests for case metadata/path export, invalid case diagnostics, and duplicate IDs.
- Runtime state tests for viewport normalization, URL sync, and copy URL behavior.
- Component/composable tests for sidebar grouping/search and props/event behaviors not currently covered.
- A small smoke fixture or documented smoke script for the real `init -> add -> dev` path if feasible.

Rationale: the existing test suite is too narrow for the amount of implemented PRD surface.

Alternative considered: rely on manual verification after implementation. That is fast once, but it makes regressions likely in the CLI/plugin/runtime boundaries.

## Risks / Trade-offs

- [Risk] Exposing runtime metadata may accidentally become part of the public API. -> Mitigation: keep metadata types internal to runtime/plugin integration and do not export them from `@mountlab/vue`.
- [Risk] Path-based grouping can be noisy in unusual project layouts. -> Mitigation: prefer explicit `case.group` whenever provided and keep fallback deterministic.
- [Risk] Fixed viewport containers can create double-scroll or clipped previews. -> Mitigation: constrain an inner preview surface while keeping the outer preview area scrollable.
- [Risk] Clipboard/open-browser APIs vary by environment. -> Mitigation: make failures non-fatal and keep existing behavior when clipboard or opener is unavailable.
- [Risk] Adding many tests at once can slow iteration. -> Mitigation: prioritize behavior-level tests around the changed boundaries instead of broad snapshot coverage.

## Migration Plan

1. Extend plugin/runtime case registry data with internal source-path metadata.
2. Update runtime state for viewport selection, URL sync, and copy-current-URL action.
3. Update sidebar/topbar/preview components for search, fallback grouping, viewport selector, and preview sizing.
4. Add `mountlab dev --open` option and keep default `mountlab dev` unchanged.
5. Update README and package metadata.
6. Add focused tests and run `npm run typecheck`, `npm test`, and `npm run build`.

Rollback is straightforward because this change does not require migrations or persisted data. Reverting the runtime metadata/state additions, CLI option, docs, and package metadata restores the previous behavior.

## Open Questions

- Should the built-in unconstrained viewport key be named `auto`, `responsive`, or something else in the UI?
- Should sidebar fallback grouping strip only `src/` or also common roots like `app/`, `components/`, and `packages/*/src/`?
- Should `dev --open` open only the first printed local URL, or respect host/network URL preferences if Vite exposes more than one?

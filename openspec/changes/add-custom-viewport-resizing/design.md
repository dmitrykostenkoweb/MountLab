## Context

The runtime workbench already has viewport presets in `MountLabConfig.viewports`, a `selectedViewportKey` in `useWorkbenchState`, a topbar `<select>`, and fixed preview sizing in `PreviewArea.vue`. That model is preset-driven: users can choose known sizes, but they cannot quickly test arbitrary dimensions without editing config or creating wrapper code.

The change should stay local to runtime UI and state. It should not change the public `Viewport` type or require new user configuration.

## Goals / Non-Goals

**Goals:**

- Represent a runtime-only `custom` viewport with `{ width, height }` dimensions.
- Let users set custom dimensions through compact width and height inputs.
- Let users resize the preview surface through pointer dragging on the right edge, bottom edge, and bottom-right corner.
- Preserve existing configured preset and `auto` viewport behavior.
- Persist custom viewport dimensions in URL state.

**Non-Goals:**

- Persist custom viewport presets back into `mountlab.config.ts`.
- Add named user-defined presets or preset management.
- Introduce iframe isolation or wrapper generation.
- Support dragging from all four sides or repositioning the preview surface.

## Decisions

1. Model custom sizing as runtime state, not config.

   Add `customViewport` beside `selectedViewportKey`. The active key can be a configured preset key, `auto`, or `custom`; `selectedViewport` resolves to `customViewport` only when the active key is `custom`.

   Alternative considered: encode custom dimensions directly inside `selectedViewportKey` as `1980x1080`. That makes URL strings compact, but it blurs the difference between config keys and runtime dimensions and complicates option resolution.

2. Use explicit URL params for custom dimensions.

   Store custom state as `viewport=custom&viewportWidth=<n>&viewportHeight=<n>`. Invalid, missing, or non-positive custom dimensions should fall back to a valid auto/unconstrained viewport during normalization.

   Alternative considered: store `viewport=1980x1080` or `size=1980x1080`. A single encoded size is shorter, but two numeric params are easier to validate and extend without string parsing edge cases.

3. Keep viewport inputs controlled by normalized runtime state.

   The topbar should display the effective fixed dimensions for a preset or the current custom dimensions for `custom`. Editing either input switches selection to `custom` and updates only the edited dimension while preserving the other effective dimension.

   Alternative considered: disable inputs unless `custom` is selected. That preserves preset immutability visually, but it adds friction; typing a dimension is a clear intent to customize.

4. Implement resize interaction in `PreviewArea` and emit dimensions upward.

   `PreviewArea` owns pointer capture and drag math because it has direct access to the rendered surface and handle geometry. It should emit the next `{ width, height }`, while `useWorkbenchState` remains the source of truth and validates/clamps dimensions.

   Alternative considered: attach global pointer listeners from the state composable. That would mix DOM interaction into state and make tests harder to isolate.

5. Clamp dimensions to a practical range.

   Runtime state should enforce a small minimum such as `100x100` and a generous maximum such as `7680x4320`. This prevents unusable zero/negative surfaces while still allowing large desktop and high-density testing.

   Alternative considered: allow any positive value. That is simpler, but extreme values can make the preview difficult to recover from and produce noisy URL state.

## Risks / Trade-offs

- [Risk] Drag behavior can conflict with preview content pointer interactions. -> Mitigation: handles should be narrow dedicated elements outside or over the preview edge, with pointer capture only after dragging starts on a handle.
- [Risk] Topbar controls can become crowded. -> Mitigation: keep numeric inputs compact, only show them when a component is selected, and reuse existing topbar control styling.
- [Risk] URL params can restore invalid dimensions. -> Mitigation: normalize and clamp custom dimensions before writing state, and fall back to auto if custom dimensions are missing or non-numeric.
- [Risk] A configured viewport named `custom` could conflict with the runtime key. -> Mitigation: reserve `custom` as a runtime viewport key in option resolution and document that runtime custom mode takes precedence.

## Migration Plan

No migration is required. Existing config presets and URLs continue to work. Existing URLs with preset viewport keys retain the same behavior, and invalid viewport params continue to normalize to auto/unconstrained mode.

Rollback is limited to removing the new runtime state, inputs, handles, and URL params; no persisted project files are changed by users through this feature.

## Open Questions

- Should the first custom size default to the current fixed preset dimensions when editing from a preset, and to a default such as `1280x800` when editing from auto? The implementation should choose a stable default if no fixed dimensions are active.

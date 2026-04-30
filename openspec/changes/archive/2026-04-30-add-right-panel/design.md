## Context

The runtime workbench currently uses a two-column layout: `Sidebar` on the left and a main column containing `TopBar` plus `PreviewArea`. `useWorkbenchState` already owns selected case, variant, wrapper, and `currentProps`, which gives the right panel a stable place to edit props without mutating case definitions.

The PRD defines a three-column workbench with a right panel for props JSON, validation, events, and notes. The change should stay runtime-only and preserve the existing CLI, Vite plugin, case discovery, package exports, and URL selection behavior.

## Goals / Non-Goals

**Goals:**

- Add `src/runtime/components/RightPanel.vue` and wire it into `WorkbenchApp.vue`.
- Change the workbench body to a three-column layout: sidebar, preview column, right panel.
- Display and edit `currentProps` as formatted JSON.
- Keep invalid JSON and invalid schema results visible without crashing preview.
- Validate parsed props against `selectedCase.propsSchema` when a compatible schema is provided.
- Render the preview from the last valid props object, not from invalid editor text.
- Capture configured component events from `selectedCase.events` and display event name, timestamp, and payload.
- Display selected case and selected variant notes.
- Provide reset and clear affordances for props and event log where they are part of the right-panel workflow.

**Non-Goals:**

- No Monaco or CodeMirror editor; a textarea is sufficient for MVP.
- No Valibot adapter unless it already matches the same minimal validation interface.
- No automatic TypeScript runtime validation.
- No persistence of edited props or event logs across reloads.
- No changes to the case file contract beyond using the existing `propsSchema`, `events`, and `notes` fields.
- No package export or CLI command changes.

## Decisions

### Keep `RightPanel.vue` focused on UI and user actions

`RightPanel.vue` should receive selected case, selected variant, JSON editor text, validation state, event entries, and notes-ready values as props. It should emit explicit actions such as props text updates, reset props, copy props, and clear events.

Rationale: the right panel will contain several sections, but it should not own the source of truth. Keeping state in `useWorkbenchState` lets preview rendering, validation, reset behavior, and URL-driven selection stay coherent.

Alternative considered: make `RightPanel.vue` own local editor state. That reduces parent wiring initially, but it creates split state because `PreviewArea` also needs the validated props object.

### Store editor text separately from valid preview props

Extend `useWorkbenchState` with `propsJsonText`, `propsJsonParseError`, `propsValidationResult`, and actions for updating/resetting props. When editor text parses and validates successfully, update `currentProps`; when it does not, keep `currentProps` unchanged and surface the error in the right panel.

Rationale: invalid JSON or invalid schema input must not crash the app or force preview into an invalid state. The user should see the editor error while the preview remains on the last valid props.

Alternative considered: bind textarea changes directly to `currentProps`. That makes invalid JSON impossible to represent cleanly and would either break rendering or require error-prone partial parsing.

### Validate through a small defensive adapter

Runtime validation should treat `propsSchema` as `unknown` and only call it when it exposes a known safe parsing interface such as `safeParse(value)`. The result should be normalized into a UI-friendly shape with status, message, and issue rows where possible.

Rationale: `core/types.ts` deliberately keeps `propsSchema` as `unknown`, and the PRD says MVP validation is optional and schema-driven. A defensive adapter avoids hard-coupling the UI to a specific imported Zod type while still supporting Zod schemas.

Alternative considered: import Zod types and use `instanceof`. That is more precise for Zod-only projects but would create a stronger runtime dependency and can fail when consumers have a different Zod instance.

### Capture events in `PreviewArea` and report them upward

`PreviewArea` should build a listener map from `selectedCase.events` and attach it to the rendered component. When a configured event fires, it emits a runtime event entry upward to `WorkbenchApp`, which passes the log to `RightPanel.vue`.

Rationale: event handlers must be attached at the component render boundary. Keeping the log in workbench state lets the right panel clear it and reset it when the selected case or variant changes.

Alternative considered: let `RightPanel.vue` subscribe to events directly. That is not practical because the right panel is not where the target component is rendered.

### Clear derived state on selection changes

When the selected case or variant changes, reset editor text from the selected variant props, reset validation state, clear event entries, and continue using the existing URL normalization rules.

Rationale: each variant should start from its fixture props and should not inherit stale event logs or editor errors from a previous selection.

Alternative considered: preserve edits while switching variants. That is a more advanced workflow and can be confusing in the MVP because props shape and schema can change between variants.

### Implement the three-column layout in `WorkbenchApp.vue`

Keep the current `TopBar` above the preview column, keep `Sidebar` as the left column, and place `RightPanel.vue` as the right column. The center column should remain flexible with `min-width: 0`; the right panel should have a fixed or clamped width and its own vertical scrolling.

Rationale: this matches the PRD layout while containing layout changes to the runtime shell. Independent scrolling prevents long JSON, validation issues, or event logs from pushing the preview off screen.

Alternative considered: place the right panel below the preview on all viewports. That would avoid horizontal space pressure but would not implement the PRD's desktop workbench layout.

## Risks / Trade-offs

- [Risk] Dynamic event names may not catch every Vue listener naming edge case. -> Mitigation: start with configured event names and Vue's `v-on` object listener mapping, then add coverage for common names such as `update:modelValue`.
- [Risk] Large event payloads or props objects can make the panel noisy. -> Mitigation: format JSON with indentation and constrain sections with scrollable areas.
- [Risk] Schema issue shapes vary across validators. -> Mitigation: normalize best-effort fields such as path, message, expected, and received, and fall back to a readable string.
- [Risk] Invalid editor text leaves preview on older props, which may be surprising. -> Mitigation: show a clear validation/error state beside the editor so the user knows changes have not been applied.
- [Risk] Fixed three-column widths can crowd small screens. -> Mitigation: use responsive constraints and allow the center preview to shrink with `min-width: 0`; mobile-specific behavior can be refined later if needed.

## Migration Plan

1. Extend `useWorkbenchState` with props JSON editor state, validation result state, event log state, and reset/update/clear actions.
2. Update `PreviewArea.vue` to attach configured event listeners and emit captured event entries.
3. Add `src/runtime/components/RightPanel.vue` with sections for props JSON, validation, events, and notes.
4. Update `WorkbenchApp.vue` to import `RightPanel.vue`, wire state/actions/events, and apply the three-column layout.
5. Add focused runtime tests or type-level checks where the existing test setup supports them.
6. Run `npm run typecheck` and `npm run build`.

Rollback is contained to runtime files: remove `RightPanel.vue`, restore the two-column workbench template/styles, and remove the new editor/validation/event state additions.

## Open Questions

- Should copied props use the raw editor text or the last successfully applied formatted JSON?
- Should event logs clear on wrapper changes, or only on case and variant changes?

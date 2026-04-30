## Context

The runtime already has a three-column workbench, a right panel, current props state, and preview binding through `useWorkbenchState`. The JSON props editor belongs in that existing right-panel/state flow: the textarea is an editable representation of `currentProps`, while the preview must continue rendering the last valid props object.

The PRD requirement is developer-facing and local-only. It does not require changing the component case authoring API, CLI commands, generated files, or package exports.

## Goals / Non-Goals

**Goals:**

- Keep a formatted JSON textarea synchronized with the selected variant and last valid edited props.
- Parse editor input immediately when the textarea changes.
- Update `currentProps` only for valid JSON objects that pass configured props validation.
- Show parse or validation errors without replacing the preview props.
- Provide reset-to-variant and copy-props actions in the right panel.
- Preserve existing event log, notes, URL selection, wrapper resolution, and render-error behavior.

**Non-Goals:**

- Persist edited props into `*.case.ts` files.
- Add URL serialization for edited props.
- Add schema inference, form controls, or visual prop editors.
- Add browser support beyond the current runtime assumptions.

## Decisions

1. Keep JSON editor state in `useWorkbenchState`.

   The editor state, parse error, validation result, and `currentProps` update rules are one state machine. Keeping them in the composable avoids duplicating validity logic in `RightPanel.vue` and keeps the preview consumer simple.

   Alternative considered: local `RightPanel.vue` state with emitted parsed props. That would split ownership between UI and workbench state and make selection resets easier to drift.

2. Treat edited props as JSON objects only.

   Component props are represented as object spreads in preview rendering. Arrays, strings, numbers, booleans, and `null` are invalid as top-level editor values even if they are valid JSON.

   Alternative considered: allow any JSON and coerce non-objects to `{}`. That would hide user mistakes and make preview behavior surprising.

3. Leave `currentProps` unchanged on parse or validation failure.

   Invalid editor text is useful while typing, but the preview should not flicker, crash, or receive partial malformed state. The textarea can diverge from preview props until it becomes valid again or is reset.

   Alternative considered: clear preview props on invalid JSON. That would make typing errors destructive and would obscure the last valid state.

4. Copy the textarea text rather than reformatting `currentProps`.

   The copy action should reflect exactly what the developer sees in the editor. When the editor currently contains invalid JSON, copying it can help them move/debug that text elsewhere; reset remains the explicit way to restore valid variant JSON.

   Alternative considered: always copy formatted last-valid props. That would conflict with the visible editor content and make the button less predictable.

## Risks / Trade-offs

- Clipboard API unavailable or blocked -> The copy action can no-op gracefully without changing props or preview state.
- JSON stringify can fail for non-serializable fixture props -> Existing formatting fallback should keep the editor usable with `{}` rather than crashing the workbench.
- Validation schemas may throw or return unexpected shapes -> Validation normalization should report readable errors and keep the preview on last valid props.

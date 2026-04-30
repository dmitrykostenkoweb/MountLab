## Why

MountLab's PRD calls out direct JSON props editing as a core MVP workflow so developers can tweak a selected variant without changing case files or navigating the host app. The runtime already has right-panel groundwork, but the JSON props editor behavior needs an explicit change contract and focused implementation verification.

## What Changes

- Ensure the right panel textarea displays the selected variant's current props as formatted JSON.
- Parse textarea edits on input/change and update preview props only after valid JSON object input.
- Keep preview bound to the last valid props when JSON is invalid and show a readable parse error.
- Reset edited props back to a fresh copy of the selected variant props.
- Copy the current editor JSON text to the clipboard from the right panel.
- Preserve existing variant selection, wrapper selection, event log, notes, and validation behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `runtime-right-panel`: Clarify and complete the JSON props editor behavior, including copy props.

## Impact

- Affects `src/runtime/components/RightPanel.vue` and `src/runtime/composables/useWorkbenchState.ts`.
- May affect `src/runtime/WorkbenchApp.vue` wiring if editor actions are not already connected.
- Requires focused verification through typecheck/build and, where possible, runtime state tests.
- No CLI, package export, or public case definition API changes.

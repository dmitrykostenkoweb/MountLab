## Why

MountLab runtime has preview and selection state, but it does not yet expose the PRD-defined right panel where developers can inspect and edit the active case details. This blocks the MVP workflow for adjusting props, seeing validation feedback, observing emitted events, and reading case or variant notes beside the preview.

## What Changes

- Add a new runtime `RightPanel.vue` component.
- Integrate the workbench into a three-column layout: left sidebar, center preview area, and right panel.
- Show the selected props as editable JSON in the right panel.
- Show validation state for the current props, including readable parse or schema validation errors.
- Show configured component events and emitted event log data when available.
- Show notes from the selected case and/or selected variant.
- Preserve existing sidebar, top bar, preview rendering, and URL selection behavior while adding the new right panel surface.

## Capabilities

### New Capabilities

- `runtime-right-panel`: Runtime right panel UI for props JSON editing, validation feedback, event visibility, notes, and three-column workbench layout.

### Modified Capabilities

- None.

## Impact

- Affects runtime Vue components under `src/runtime/`, especially `WorkbenchApp.vue` and the new `src/runtime/components/RightPanel.vue`.
- May extend runtime state/composable behavior to support props JSON editing, reset/copy actions, validation result display, and event log data flow.
- May add or update runtime tests for layout wiring and right panel behavior.
- No public CLI command changes.
- No package export changes expected.

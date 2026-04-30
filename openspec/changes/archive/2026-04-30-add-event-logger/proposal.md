## Why

Developers need a local way to observe emitted component events while exercising a selected case in the runtime workbench. Without an event logger, verifying event names and payloads requires leaving MountLab or instrumenting the component manually.

## What Changes

- Build preview event handlers from the selected case `events` list.
- Record emitted event name, payload, and timestamp in runtime state.
- Display event log entries in the right panel.
- Add a clear action for existing event log entries.
- Clear stale event entries when the selected case changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `runtime-right-panel`: Add explicit event logging behavior for configured selected-case events, including display and clearing.

## Impact

- Affects `src/runtime/components/PreviewArea.vue`, `src/runtime/components/RightPanel.vue`, `src/runtime/WorkbenchApp.vue`, and `src/runtime/composables/useWorkbenchState.ts`.
- No component case authoring API, CLI command, generated file, package export, or dependency changes are required.

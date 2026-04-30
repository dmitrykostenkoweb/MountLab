## Why

Runtime props validation is part of the MountLab MVP workflow, but the behavior must be explicit and robust so invalid edited props do not crash the workbench or replace the last valid preview state.

## What Changes

- Validate edited props against an optional case-level `propsSchema` when the schema exposes a `safeParse(value)` function.
- Treat missing or incompatible schemas as validation unavailable, while still allowing valid JSON object props to update the preview.
- Normalize schema errors into readable issue rows containing `path` and `message`, plus `expected` and `received` when the schema provides them.
- Keep the preview rendered with the last valid props when JSON or schema validation fails, and surface the failure in the right panel without crashing the UI.

## Capabilities

### New Capabilities

### Modified Capabilities
- `runtime-right-panel`: Clarify and complete props schema validation behavior for the props JSON editor and validation feedback.

## Impact

- Affects runtime state and validation logic in `src/runtime/composables/useWorkbenchState.ts`.
- Affects validation feedback rendering in `src/runtime/components/RightPanel.vue`.
- May require focused tests for optional schema handling, Zod-compatible `safeParse` success/failure, issue normalization, and last-valid props preservation.

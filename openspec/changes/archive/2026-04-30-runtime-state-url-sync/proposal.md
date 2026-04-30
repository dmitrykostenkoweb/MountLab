## Why

MountLab runtime currently keeps selection state directly inside the workbench component and only passes variant props through to preview. This blocks upcoming MVP work such as editable props, validation, event logging, and shareable URLs because there is no single authoritative state model for the selected case, variant, wrapper, and current props.

This change establishes stable runtime state behavior first, so later UI features can build on predictable selection, reset, and URL restoration semantics.

## What Changes

- Introduce a shared runtime state model for the selected case, selected variant, selected wrapper, and current props.
- Reset current props to the selected variant props whenever the selected case or variant changes.
- Restore initial selection from URL query params: `case`, `variant`, and `wrapper`.
- Keep URL query params synchronized when the user changes case, variant, or wrapper.
- Gracefully fall back to the first valid case, first valid variant, and a valid wrapper/default wrapper when URL params are missing or invalid.
- Preserve existing preview behavior while making state explicit and reusable by later right-panel, props editor, validation, and event logger work.

## Capabilities

### New Capabilities

- `runtime-state-url-sync`: Runtime workbench state management and URL query synchronization for case, variant, wrapper, and current props.

### Modified Capabilities

- None.

## Impact

- Affects runtime Vue components under `src/runtime/`, especially `WorkbenchApp.vue` and the props passed into `TopBar` and `PreviewArea`.
- May introduce a small runtime composable/helper module to isolate selection, props reset, and URL synchronization logic.
- No public package API changes.
- No CLI, Vite plugin, or generated case file contract changes.

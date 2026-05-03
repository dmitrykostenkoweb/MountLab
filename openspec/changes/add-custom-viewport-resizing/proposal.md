## Why

Viewport presets are useful for common screen sizes, but they make ad hoc responsive testing slow when a developer needs to inspect an exact or intermediate size. MountLab should let users adjust the preview viewport directly at runtime instead of requiring extra wrapper code or config changes.

## What Changes

- Add a `custom` viewport mode owned by runtime state, separate from configured presets.
- Add width and height controls so users can type exact viewport dimensions such as `1980x1080`.
- Add drag resize handles on the preview surface so users can resize the fixed viewport interactively.
- Switch the active viewport to `custom` whenever dimensions are changed manually or by dragging.
- Persist custom viewport dimensions in URL state so a copied or reloaded workbench URL restores the same size.
- Keep `auto` mode and configured viewport presets working as they do today.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime-viewport-controls`: Extend viewport controls from preset-only selection to include editable and draggable custom viewport dimensions.

## Impact

- Runtime state composable: add custom viewport state, validation, URL synchronization, and selection helpers.
- Top bar UI: add compact width and height inputs beside the viewport selector.
- Preview area UI: add resize handles and pointer interaction for width, height, and corner resizing.
- Tests: cover custom viewport restoration, input-driven resizing, drag-driven resizing state, invalid dimensions, and existing preset/auto behavior.

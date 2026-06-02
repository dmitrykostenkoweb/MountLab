## Why

MountLab currently edits all props through one JSON textarea. That is flexible, but it makes common component tweaking slower than necessary: changing a label, number, or boolean requires editing JSON syntax instead of using the kind of control that matches the prop value.

The props panel should expose each top-level prop as an individual control. Primitive values should use simple form controls, while complex values should keep JSON text editing at the individual prop level.

## What Changes

- Replace the single props JSON textarea workflow with per-prop controls in the right panel.
- Render string props as text inputs, number props as number inputs, and boolean props as on/off switches.
- Render array and object props as JSON textareas scoped to that prop.
- Seed fields from Vue runtime component prop options when the selected variant has no authored props.
- Keep reset and copy actions for the complete props object.
- Keep schema validation on the full props object after each successful field edit.
- Keep preview rendering on the last valid props when an individual field edit is invalid.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime-right-panel`: Replace whole-object JSON editing with individual top-level prop controls.

## Impact

- Runtime state: add field-level prop update handling while preserving `currentProps` as the single preview source of truth.
- Right panel UI: render controls from current top-level props and show field-local JSON errors for object and array edits.
- Auto-discovered components: expose controls for runtime-declared props even when the synthetic variant starts with empty props.
- Validation: validate the full next props object after each accepted field edit, and preserve last valid preview props on parse or schema failure.
- Tests: cover primitive field edits, boolean switches, object/array textarea parsing, invalid field JSON behavior, reset, copy, and schema validation interactions.

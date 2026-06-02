## 1. Runtime State

- [x] 1.1 Introduce a field-level props edit API that updates one top-level prop at a time.
- [x] 1.2 Preserve `currentProps` as the single preview source of truth.
- [x] 1.3 Validate the complete next props object after each field edit.
- [x] 1.4 Keep preview on the last valid props when a field edit is invalid.
- [x] 1.5 Track field-local draft text and parse errors for object, array, and null JSON textareas.
- [x] 1.6 Ensure reset restores selected variant props and clears field-local errors.
- [x] 1.7 Ensure copy writes the complete current props object as formatted JSON.
- [x] 1.8 Seed empty variant props from Vue runtime component prop options when available.

## 2. Right Panel UI

- [x] 2.1 Replace the single props JSON textarea with per-prop controls.
- [x] 2.2 Render string props as text inputs.
- [x] 2.3 Render number props as number inputs with invalid number handling.
- [x] 2.4 Render boolean props as on/off switches.
- [x] 2.5 Render object, array, and null props as JSON textareas scoped to each prop.
- [x] 2.6 Show field-local parse errors near the relevant textarea.
- [x] 2.7 Keep validation status visible for full-object schema validation results.
- [x] 2.8 Keep reset and copy actions available for the whole props object.

## 3. Tests

- [x] 3.1 Add runtime state tests for string, number, and boolean field edits.
- [x] 3.2 Add runtime state tests for object and array JSON textarea edits.
- [x] 3.3 Add tests proving invalid field JSON keeps preview props unchanged.
- [x] 3.4 Add tests proving schema validation failures keep preview props unchanged.
- [x] 3.5 Add reset and copy regression tests for the field-control workflow.
- [x] 3.6 Add component tests or focused render tests for the right panel controls if the current test setup supports it.

## 4. Verification

- [x] 4.1 Run the relevant unit tests.
- [x] 4.2 Run project typecheck/build verification.
- [x] 4.3 Run `openspec validate add-individual-prop-controls --strict`.

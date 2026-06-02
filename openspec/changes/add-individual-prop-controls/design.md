## Context

The current runtime flow treats the props editor as one formatted JSON document:

```txt
RightPanel textarea
      |
      v
updatePropsJsonText(value)
      |
      v
JSON.parse(whole object)
      |
      v
validateProps(parsed object)
      |
      v
currentProps -> PreviewArea
```

This is simple and expressive, but it makes the highest-frequency edits noisy. The state model already has a good boundary: `currentProps` is the authoritative object used by preview rendering, and validation already works on a complete object. The change should keep that boundary and only replace how the right panel edits it.

## Goals / Non-Goals

**Goals:**

- Show each top-level prop as its own editable field.
- Use input controls that match the current prop value type.
- Keep object and array editing possible through JSON textareas.
- Preserve reset, copy, validation feedback, and last-valid-preview behavior.
- Avoid mutating selected variant props.

**Non-Goals:**

- Parse Vue `defineProps` declarations.
- Add schema introspection or automatic control metadata.
- Edit deeply nested object fields with generated nested controls.

## Decisions

1. Derive controls from top-level `currentProps` entries.

   Authored variant props remain the first source of editable fields. This keeps existing `.case.ts` fixtures authoritative.

2. Seed empty variants from Vue runtime prop options.

   Auto-discovered synthetic cases start with `props: {}`. For those cases, the runtime should derive initial `currentProps` from `selectedCase.component.props` when Vue exposes runtime prop options. Defaults from `withDefaults(defineProps(...))` should be used when present; otherwise string, number, boolean, array, and object prop types should receive simple placeholder values.

   This is not TypeScript AST inference. It only uses the runtime prop metadata already present on the imported Vue component.

3. Choose the control from the current value type.

   ```txt
   string  -> text input
   number  -> number input
   boolean -> switch / checkbox
   object  -> JSON textarea
   array   -> JSON textarea
   null    -> JSON textarea
   ```

   `null` is treated as complex/unknown because there is no reliable primitive type signal.

4. Validate after constructing a full next props object.

   A field edit should clone the current editable props, replace one top-level key, then pass the whole object through the existing validation path. This keeps schema behavior consistent with the current JSON editor.

5. Preserve last valid preview props.

   If a primitive edit fails schema validation, or an object/array textarea contains invalid JSON, `currentProps` should remain unchanged. The panel can still retain the user's field text and show an error for that field.

6. Keep copy as whole-object JSON.

   Copying individual field values is not needed for this change. The existing copy action should continue copying the complete current props object as formatted JSON so users can transfer a working fixture back into a case file.

7. Reset clears field-local editor errors.

   Reset should restore a fresh clone of selected variant props, refresh the generated controls, clear stale field-local parse errors, and rerun validation.

## Risks / Trade-offs

- [Risk] Props declared only at the TypeScript type level may not be available at runtime. -> Mitigation: use Vue runtime `component.props` when present; otherwise authored variants remain the reliable source of editable fields.
- [Risk] Number input can produce an empty string while the target type is number. -> Mitigation: treat empty or non-finite number input as an invalid field edit and keep preview on last valid props.
- [Risk] Field-local textarea text can drift from `currentProps` when invalid. -> Mitigation: model field-local draft/error state separately from `currentProps` and reset it when selection or reset changes.
- [Risk] Switching from whole JSON to field controls removes a fast escape hatch for adding ad hoc keys. -> Mitigation: keep copy whole-object JSON now; adding an advanced raw JSON mode can be a later explicit feature if needed.

## Open Questions

- Should the panel provide an advanced raw JSON mode as a secondary escape hatch, or should this change fully replace the single JSON editor?
- Should users be able to add or remove top-level prop keys from the panel, or should editable keys stay limited to the selected variant's current props?

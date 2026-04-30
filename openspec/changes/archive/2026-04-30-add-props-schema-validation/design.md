## Context

The runtime right panel already owns the props JSON editor state and passes current props to the preview through `useWorkbenchState`. `propsSchema` is intentionally typed as `unknown` in the public case contract, so runtime validation must use capability detection instead of importing or requiring a concrete schema library type.

Invalid editor input is expected while developers type. The preview must continue rendering the last valid props object, and validation failures must be reported as UI feedback rather than thrown through Vue rendering.

## Goals / Non-Goals

**Goals:**
- Support Zod-compatible schemas by detecting and calling `safeParse(value)`.
- Keep `propsSchema` optional and non-blocking when absent or incompatible.
- Normalize validation failures into readable `path`, `message`, `expected`, and `received` fields where the schema exposes them.
- Prevent invalid props from replacing `currentProps` while keeping the workbench usable.

**Non-Goals:**
- Add a direct `zod` dependency or require users to install a specific schema package for MountLab runtime types.
- Validate props at case discovery time or CLI generation time.
- Persist edited props back to case files.
- Support async schema validation in this change.

## Decisions

### Detect schemas structurally

Validation will treat `propsSchema` as compatible only when it is an object exposing a callable `safeParse` method. This supports Zod without coupling MountLab runtime to Zod imports or nominal types.

Alternative considered: import Zod types and require `propsSchema` to be a Zod schema. That would make optional validation less flexible and would turn a runtime convenience into a hard package-level coupling.

### Normalize safeParse results into UI state

The validation adapter will convert successful `safeParse` results into a valid state and failed results into invalid issue rows. Zod-style `error.issues` entries will map `path` arrays to dot-separated strings and expose `expected` and `received` when present.

Alternative considered: render raw schema errors. That leaks library-specific shapes into Vue templates and often produces less readable feedback.

### Preserve last valid props

`currentProps` will only update after JSON parsing, object-shape checking, and schema validation all succeed. Invalid JSON, non-object JSON, failed schema validation, thrown schema errors, or unexpected validation output will update error state only.

Alternative considered: pass invalid editor data to preview and rely on component error boundaries. That makes normal typing errors disruptive and can crash or blank the preview for recoverable validation issues.

## Risks / Trade-offs

- [Risk] Non-Zod schemas may expose `safeParse` with a different result shape. -> Mitigation: handle unexpected results as validation failure with a readable generic error.
- [Risk] Some schemas transform valid props into non-object data. -> Mitigation: reject non-object validated output because preview rendering uses object spread semantics.
- [Risk] `safeParse` may throw despite its name. -> Mitigation: catch exceptions, show a validation error, and keep last valid props.
- [Risk] Dot-separated paths can be ambiguous for object keys containing dots. -> Mitigation: keep the first implementation readable and testable; richer path rendering can be added later without changing the validation contract.

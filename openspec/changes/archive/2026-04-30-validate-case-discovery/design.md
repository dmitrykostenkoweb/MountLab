## Context

`virtual:mountlab/cases` currently uses `fast-glob` to resolve configured case files, generates eager imports for each file, and exports the imported default values as `cases`. This satisfies basic discovery, but it leaves domain errors unnamed: invalid default exports, missing required fields, and duplicate case IDs surface later or indirectly in the runtime.

This change should keep the existing eager-import MVP design. The Vite plugin already knows the absolute file paths for each imported case, so the generated virtual module is the right place to associate each imported value with its source path and raise MountLab-specific errors.

## Goals / Non-Goals

**Goals:**

- Validate discovered case objects before exporting `cases`.
- Report duplicate `id` values with every involved source file path.
- Report invalid case objects with clear MountLab-specific error messages.
- Keep generated registry output deterministic.
- Preserve current runtime UI behavior and public APIs.

**Non-Goals:**

- No right-panel or runtime error UI.
- No validation of props, props schemas, wrappers, or variant payload shape.
- No lazy-loading registry conversion.
- No changes to `defineComponentCase`, CLI commands, or generated case templates.

## Decisions

- Validate inside the generated `virtual:mountlab/cases` module.
  - Rationale: eager imports are already generated there, and the module can keep a parallel source-path list for error reporting. Throwing from the virtual module lets Vite show a client overlay while keeping the dev server process alive.
  - Alternative considered: validate in `WorkbenchApp`. That would require passing source-path metadata into runtime state and would let invalid cases reach the UI before being rejected.

- Keep validation deliberately shallow.
  - Rationale: MVP discovery only needs to ensure the runtime receives usable `ComponentCase` entries. The required checks are object-like default export, non-empty string `id`, present `component`, and `variants` as an array.
  - Alternative considered: validate the full `ComponentCase` contract including variant object fields and event names. That increases scope and overlaps with upcoming props editor and runtime validation work.

- Detect duplicate IDs after individual shape validation.
  - Rationale: duplicate reporting depends on trustworthy `id` values. Once each case has a valid non-empty string `id`, the validator can group by ID and report all matching paths.
  - Alternative considered: report only the second duplicate encountered. That is less helpful because the developer needs both file paths to resolve the conflict.

- Sort discovered case paths before generating imports.
  - Rationale: deterministic order makes sidebar order, generated module contents, and duplicate diagnostics stable across runs.
  - Alternative considered: rely on `fast-glob` order. That may be stable in practice but is not an explicit MountLab guarantee.

## Risks / Trade-offs

- [Risk] Throwing from the virtual module means invalid discovery prevents the workbench app from mounting. → Mitigation: keep messages readable and rely on Vite overlay for fast correction.
- [Risk] Shallow `component` validation cannot prove a value is a real Vue component. → Mitigation: require presence only for discovery; render-time errors remain handled by preview error capture.
- [Risk] Absolute paths in errors can be noisy. → Mitigation: generate paths relative to the project root when possible, while retaining enough context to find the file.
- [Risk] Generated validation code may become hard to read if embedded as a long string. → Mitigation: keep helper code compact and local to `generateCasesModule`; extract string builders only if needed.

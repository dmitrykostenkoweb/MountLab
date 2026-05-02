## 1. Case Registry Metadata

- [x] 1.1 Extend the Vite plugin generated case registry with internal source path metadata for each discovered case.
- [x] 1.2 Preserve the existing validated `cases` export or provide a compatibility path for current runtime injection.
- [x] 1.3 Update runtime entry/app wiring so sidebar-facing code can access case metadata without requiring users to author `path` fields.
- [x] 1.4 Add plugin tests for deterministic metadata order, source path values, invalid case diagnostics, and duplicate ID diagnostics.

## 2. Sidebar Navigation

- [x] 2.1 Add sidebar helper logic for explicit group selection and deterministic source-path fallback grouping.
- [x] 2.2 Add a sidebar search input that filters by title, id, group, fallback group, and source path.
- [x] 2.3 Add an empty search-results state that does not change the active case selection.
- [x] 2.4 Add tests for explicit grouping, path fallback grouping, empty metadata fallback, title/id/path search, and empty results.

## 3. Viewport State And Preview

- [x] 3.1 Extend `useWorkbenchState` with selected viewport key, viewport fallback resolution, and resolved viewport data.
- [x] 3.2 Synchronize the selected viewport with the `viewport` URL query parameter while preserving unrelated params.
- [x] 3.3 Add a viewport selector to the topbar using configured `MountLabConfig.viewports` plus a built-in unconstrained mode.
- [x] 3.4 Update `PreviewArea` to constrain an inner preview surface for fixed viewport dimensions and keep auto mode unconstrained.
- [x] 3.5 Add runtime tests for viewport restoration, invalid viewport fallback, URL sync, and preview sizing inputs.

## 4. Share URL Action

- [x] 4.1 Add a runtime action for copying the current normalized workbench URL to the clipboard.
- [x] 4.2 Wire the copy URL action into an appropriate runtime UI control without changing case, variant, wrapper, viewport, props, or event state.
- [x] 4.3 Handle unavailable or failing clipboard writes without crashing the workbench.
- [x] 4.4 Add tests for successful copy URL, state preservation, and clipboard failure behavior.

## 5. CLI Dev Open Option

- [x] 5.1 Add a `--open` option to the `mountlab dev` Commander subcommand and pass it into `runDev`.
- [x] 5.2 Update `runDev` to open the final local workbench URL after the Vite server starts when requested.
- [x] 5.3 Keep default `mountlab dev` startup behavior unchanged when `--open` is omitted.
- [x] 5.4 Add CLI tests for `dev --open` option wiring and non-fatal open failure behavior.

## 6. Package Metadata And Documentation

- [x] 6.1 Add `peerDependenciesMeta` entries marking `vue` and `vite` peers as optional while preserving existing version constraints.
- [x] 6.2 Update README status and quick start to describe the current implemented MountLab workflow.
- [x] 6.3 Document implemented MVP features separately from future roadmap or non-goal features.
- [x] 6.4 Add or update documented smoke steps for validating `init`, `add`, and `dev` against a minimal Vue/Vite project.

## 7. Broader Verification

- [x] 7.1 Add or expand CLI tests for existing `init` and `add` option wiring.
- [x] 7.2 Add runtime tests covering existing props JSON editing, invalid JSON handling, schema validation, event logging, and copy props behavior.
- [x] 7.3 Ensure the smoke path is either automated or clearly documented enough for maintainers to run manually.
- [x] 7.4 Run `npm run typecheck`, `npm test`, and `npm run build`.
- [x] 7.5 Run `openspec validate --changes complete-prd-gap-backlog` after implementation updates.

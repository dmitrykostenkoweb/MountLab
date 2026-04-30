## Why

MountLab currently discovers `*.case.ts` files and exports them through `virtual:mountlab/cases`, but it does not validate the resulting case objects or detect duplicate case IDs. This makes broken case files fail later and less clearly in the runtime UI, which slows down the component workbench loop the MVP is meant to improve.

## What Changes

- Validate discovered case modules before exporting the runtime `cases` array.
- Report invalid case objects with readable MountLab-specific errors that include the source case file path.
- Detect duplicate `ComponentCase.id` values and report all involved case file paths.
- Keep case discovery deterministic so generated registries and duplicate reports are stable.
- Preserve the current eager-import MVP registry approach and avoid adding new runtime UI features in this change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `vite-plugin-virtual-modules`: Extend the `virtual:mountlab/cases` contract to validate discovered case modules, reject duplicate IDs, and produce useful errors for invalid case discovery output.

## Impact

- Affects `src/plugin/index.ts`, specifically case path resolution and generated code for `virtual:mountlab/cases`.
- May add internal helper functions for case path ordering, generated registry validation, or error formatting.
- Does not change the public core helper API, CLI command syntax, generated case template, or runtime UI behavior beyond receiving only validated case objects.

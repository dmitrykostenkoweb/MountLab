## Why

MountLab currently requires a co-located `*.case.ts` file before a Vue component appears in the workbench. That makes the first-run experience heavier than necessary: a developer must create `ProductCard.case.ts` even when they only want to inspect the component and start experimenting.

MountLab should be able to discover Vue components directly and create a minimal runtime case for each component that does not have an authored case file. Authored case files should remain supported for richer variants, events, notes, wrappers, and explicit fixture props.

## What Changes

- Add optional Vue component discovery through a new `MountLabConfig.components` glob list.
- Generate synthetic component cases for discovered `.vue` files that do not have a matching authored `.case.ts`.
- Keep `*.case.ts` as an optional enrichment layer: when an authored case exists for a component, the authored case wins.
- Give synthetic cases stable IDs, titles, groups, source metadata, and one default variant with empty props.
- Update Vite plugin watching so adding/removing component files or case files refreshes the runtime registry.
- Update the playground to use component discovery instead of requiring `ProductCard.case.ts`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `core-types`: Add `MountLabConfig.components` for Vue component discovery.
- `vite-plugin-virtual-modules`: Extend `virtual:mountlab/cases` generation to include synthetic cases for discovered Vue components without authored cases.

## Impact

- Vite plugin: discover configured component globs, pair components with authored cases, generate synthetic cases, validate duplicate IDs after merging, and watch both component and case globs.
- Core types: expose the optional `components` config field.
- Example playground: remove the authored `ProductCard.case.ts` requirement and configure component discovery.
- Tests: cover synthetic case generation, authored case precedence, deterministic ordering, duplicate diagnostics, and watcher invalidation behavior where practical.

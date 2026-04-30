## Why

The current package build succeeds, but `npm run typecheck` fails because the runtime entry imports a Vue SFC without a TypeScript module declaration. This blocks reliable iteration on the MVP runtime work and should be fixed before adding larger features such as the props editor, validation, and event logger.

## What Changes

- Ensure the source tree type-checks cleanly with `npm run typecheck`.
- Remove unused runtime imports so the runtime code stays clean before further UI work.
- Keep the existing production build behavior intact and verify `npm run build` still succeeds.
- Add or adjust project-level TypeScript support needed for Vue SFC imports.

## Capabilities

### New Capabilities

- `development-verification`: Covers repository-level verification expectations for type-checking and build commands used during MountLab development.

### Modified Capabilities

- None.

## Impact

- Affects TypeScript/Vue module typing for runtime source files.
- Affects runtime source hygiene only; no user-facing CLI, plugin, or core API behavior should change.
- Verification commands affected: `npm run typecheck` and `npm run build`.

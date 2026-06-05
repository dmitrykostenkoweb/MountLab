## Why

Auto-discovered Vue components can emit events, but synthetic MountLab cases currently omit `events`, so the Events tab appears broken for components such as the playground `ProductCard.vue`. This matters now because the playground moved from an authored `ProductCard.case.ts` to component auto-discovery, removing the explicit event list that the event logger depends on.

## What Changes

- Infer event names for synthetic cases from Vue SFC `defineEmits` declarations when the component file is discoverable and the event names are statically readable.
- Include inferred event names in generated synthetic `ComponentCase.events` so existing preview event listeners and right-panel logging continue to work.
- Preserve authored case precedence: authored sidecar cases remain authoritative for variants, props, events, wrappers, and notes.
- Surface a clearer Events-tab empty state when a selected case has no configured or inferred events.
- Do not infer events from runtime behavior, TypeScript-only external declarations, or non-static expressions in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `vite-plugin-virtual-modules`: synthetic cases generated for configured Vue components shall include statically inferred event names when available.
- `runtime-right-panel`: the Events tab shall make the no-events state clear for selected cases without configured or inferred event names.

## Impact

- Affects the Vite plugin synthetic-case generation path in `src/plugin/index.ts`.
- Adds or updates focused plugin tests for `defineEmits` inference and authored-sidecar precedence.
- May add a small runtime right-panel test or snapshot-style assertion for the clearer no-events state.
- No public config shape changes and no breaking changes to authored case files.

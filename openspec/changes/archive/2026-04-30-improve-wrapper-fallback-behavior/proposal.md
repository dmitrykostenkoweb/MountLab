## Why

Preview should remain usable when a case references a wrapper key that is not configured. Today this edge case can leave the runtime with no active wrapper signal, making it unclear to the developer why the selected case is not using the expected layout.

## What Changes

- Resolve a missing case-level wrapper by falling back to the configured default wrapper when it exists.
- Resolve a missing default wrapper by falling back to the built-in empty wrapper.
- Show a non-blocking UI warning when wrapper resolution falls back because a requested wrapper key is unavailable.
- Keep component preview rendering in all fallback cases.

## Capabilities

### New Capabilities

### Modified Capabilities
- `runtime-state-url-sync`: Clarify wrapper resolution and warning behavior when case or default wrapper keys do not resolve.

## Impact

- Runtime state wrapper resolution in `src/runtime/composables/useWorkbenchState.ts`.
- Runtime preview/topbar UI surfaces that expose selected wrapper state or warnings.
- Tests covering missing case wrapper, missing default wrapper, and non-blocking preview fallback.

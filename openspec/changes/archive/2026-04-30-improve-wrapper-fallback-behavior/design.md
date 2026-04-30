## Context

The runtime state model stores a selected wrapper key and exposes `wrapperComponent` to `PreviewArea`. Current resolution already considers explicit selection, case wrapper, and `defaultWrapper`, then returns `null`; the preview renders `wrapperComponent ?? 'div'`, so a missing wrapper can still render through an empty built-in wrapper. What is missing is precise fallback semantics for a case wrapper that points to a non-existent key and a UI warning that explains the fallback.

Wrapper warnings are runtime diagnostics for the developer using MountLab. They should not be treated as render errors because the selected component can still be mounted with either the default wrapper or the empty wrapper.

## Goals / Non-Goals

**Goals:**
- Keep preview rendering when a case wrapper key is not present in `config.wrappers`.
- Prefer the configured default wrapper when the selected case wrapper is missing and the default key resolves.
- Use the built-in empty wrapper when neither the case wrapper nor the default wrapper resolves.
- Expose a non-blocking warning message in runtime UI whenever a configured wrapper reference cannot be resolved.

**Non-Goals:**
- Validate wrapper keys during case discovery or fail `virtual:mountlab/cases` loading.
- Change CLI-generated default wrapper names.
- Add a new wrapper registration format.

## Decisions

1. Keep fallback resolution in `useWorkbenchState`.

   The composable already owns selected case, selected wrapper key, URL synchronization, and wrapper resolution. Extending it with a derived `wrapperWarning` keeps the warning consistent across initial URL state, case selection, and config changes.

   Alternative considered: detect missing wrappers inside `PreviewArea`. That would duplicate resolution context and make it harder to distinguish missing case wrapper from missing default wrapper.

2. Represent the built-in empty wrapper as `wrapperComponent === null`.

   `PreviewArea` already renders a `div` when no wrapper component is available. Keeping that contract avoids introducing a placeholder component solely for fallback and preserves current preview behavior.

   Alternative considered: create and export an explicit `EmptyWrapper` component. That is unnecessary unless future behavior needs named wrapper metadata or styling.

3. Surface warnings as UI state, not thrown errors.

   Missing wrapper keys are configuration problems, but they are recoverable. The runtime should warn while continuing to render the selected component with the resolved fallback.

   Alternative considered: reject cases with unknown wrapper keys. That would block preview and make experimentation with wrapper config more brittle.

## Risks / Trade-offs

- Warning text could become stale after wrapper selection or config changes -> derive it from normalized runtime state and selected case/config each time state changes.
- URL wrapper params can refer to removed wrappers -> continue normalizing invalid explicit wrapper keys to a valid fallback and show a warning only when a requested key was unavailable.
- The top bar wrapper selector only lists configured wrappers -> show the warning outside the selector so the built-in empty fallback does not need to appear as a selectable configured wrapper.

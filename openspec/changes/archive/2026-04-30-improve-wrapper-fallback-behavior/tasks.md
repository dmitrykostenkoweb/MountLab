## 1. Runtime State

- [x] 1.1 Extend `useWorkbenchState` wrapper resolution to track the requested wrapper key, resolved wrapper key, and fallback reason for missing case/default wrapper keys.
- [x] 1.2 Expose a computed wrapper warning message from `useWorkbenchState` without changing the existing preview render-error flow.
- [x] 1.3 Ensure invalid explicit URL wrapper params still normalize to a valid fallback wrapper or `null` for the built-in empty wrapper.

## 2. UI Integration

- [x] 2.1 Pass wrapper warning state from `WorkbenchApp.vue` into the appropriate runtime UI component.
- [x] 2.2 Render a visible non-blocking warning when wrapper fallback occurs.
- [x] 2.3 Keep `PreviewArea` rendering the selected component with the resolved wrapper or built-in empty wrapper in all fallback cases.

## 3. Verification

- [x] 3.1 Add or update tests for a missing case wrapper falling back to an existing default wrapper.
- [x] 3.2 Add or update tests for a missing case wrapper and missing default wrapper falling back to the built-in empty wrapper.
- [x] 3.3 Add or update tests that assert wrapper fallback warnings are shown while preview remains usable.
- [x] 3.4 Run the project verification command for typecheck/build/tests and address regressions.

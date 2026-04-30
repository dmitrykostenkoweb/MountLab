## 1. Runtime State Composable

- [x] 1.1 Create `src/runtime/composables/useWorkbenchState.ts` for runtime selection and props state.
- [x] 1.2 Implement URL param reading for `case`, `variant`, and `wrapper` with browser-safe guards.
- [x] 1.3 Implement case and variant fallback resolution for missing or invalid selections.
- [x] 1.4 Implement wrapper fallback resolution from explicit wrapper, case wrapper, default wrapper, then built-in empty fallback.
- [x] 1.5 Implement current props cloning from selected variant props, including empty-object fallback.

## 2. Runtime Component Refactor

- [x] 2.1 Refactor `src/runtime/WorkbenchApp.vue` to use the runtime state composable.
- [x] 2.2 Keep `Sidebar` selection behavior wired to the composable's case selection API.
- [x] 2.3 Keep `TopBar` variant and wrapper controls wired to the composable's selection API.
- [x] 2.4 Update `src/runtime/components/PreviewArea.vue` to receive `currentProps` and bind those props to the selected component.
- [x] 2.5 Ensure preview still renders with a built-in empty wrapper when no configured wrapper resolves.

## 3. URL Synchronization

- [x] 3.1 Synchronize active case, variant, and wrapper IDs into URL query params after selection changes.
- [x] 3.2 Preserve unrelated existing URL query params during synchronization.
- [x] 3.3 Use `history.replaceState` so routine selection changes do not add browser history entries.
- [x] 3.4 Normalize invalid initial URL params to valid state and reflect the normalized state in the URL.

## 4. Selection Reset Behavior

- [x] 4.1 Reset `currentProps` when the selected case changes.
- [x] 4.2 Reset `currentProps` when the selected variant changes.
- [x] 4.3 Ensure cloned `currentProps` edits cannot mutate the source variant props object.
- [x] 4.4 Re-normalize state if discovered cases change during HMR and the current case or variant becomes invalid.

## 5. Verification

- [x] 5.1 Add focused unit coverage for state fallback, props cloning, and URL synchronization if the repo has or gains a test runner for runtime helpers.
- [x] 5.2 Manually smoke-check runtime behavior with valid and invalid `case`, `variant`, and `wrapper` URL params.
- [x] 5.3 Run `npm run typecheck`.
- [x] 5.4 Run `npm run build`.

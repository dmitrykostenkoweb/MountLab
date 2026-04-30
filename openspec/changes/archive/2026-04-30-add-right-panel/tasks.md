## 1. Runtime State

- [x] 1.1 Add props JSON editor state to `useWorkbenchState`: editor text, parse error, validation result, and update/reset actions.
- [x] 1.2 Implement defensive props schema validation for schemas exposing `safeParse(value)`.
- [x] 1.3 Keep `currentProps` unchanged when JSON parsing or schema validation fails.
- [x] 1.4 Reset props editor state and validation state when selected case or variant changes.
- [x] 1.5 Add event log state and clear/reset actions to `useWorkbenchState`.

## 2. Preview Event Capture

- [x] 2.1 Update `PreviewArea.vue` to accept configured event names from the selected case.
- [x] 2.2 Attach dynamic listeners to the rendered component for configured event names.
- [x] 2.3 Emit captured event entries upward with event name, timestamp, and payload.
- [x] 2.4 Preserve existing preview render-error handling and wrapper behavior.

## 3. Right Panel Component

- [x] 3.1 Create `src/runtime/components/RightPanel.vue`.
- [x] 3.2 Add props JSON section with textarea, reset action, copy action, and parse error display.
- [x] 3.3 Add validation section showing unavailable, valid, and invalid states with readable issue details.
- [x] 3.4 Add events section showing configured events, captured event entries, payloads, and clear action.
- [x] 3.5 Add notes section showing selected case notes and selected variant notes without stale content.
- [x] 3.6 Style the panel for independent vertical scrolling and readable long JSON/event content.

## 4. Workbench Wiring and Layout

- [x] 4.1 Import and render `RightPanel.vue` from `WorkbenchApp.vue`.
- [x] 4.2 Wire right panel props and actions to `useWorkbenchState`.
- [x] 4.3 Wire captured preview events into the workbench event log state.
- [x] 4.4 Update `WorkbenchApp.vue` styles from two-column to PRD-aligned three-column layout.
- [x] 4.5 Ensure sidebar, topbar, preview rendering, and URL selection behavior remain intact.

## 5. Verification

- [x] 5.1 Add or update focused tests for props JSON parsing, validation behavior, and reset behavior where the current test setup supports it.
- [x] 5.2 Add or update focused tests for event log capture and clearing where the current test setup supports it.
- [x] 5.3 Run `npm run typecheck`.
- [x] 5.4 Run `npm run build`.

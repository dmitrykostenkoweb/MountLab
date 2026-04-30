## 1. Runtime State

- [x] 1.1 Verify `useWorkbenchState` owns props editor text, parse error, validation result, and current props updates.
- [x] 1.2 Ensure valid JSON object edits update `currentProps` and preview props.
- [x] 1.3 Ensure invalid JSON or non-object JSON leaves `currentProps` unchanged and exposes a readable error.
- [x] 1.4 Ensure schema validation failures leave `currentProps` unchanged while valid schema output can update props.
- [x] 1.5 Ensure reset restores a fresh copy of selected variant props and reformats editor JSON.
- [x] 1.6 Ensure copy props writes the current editor text to the clipboard when the Clipboard API is available.

## 2. Right Panel UI

- [x] 2.1 Verify `RightPanel.vue` renders the props textarea with current editor text.
- [x] 2.2 Wire textarea input/change to the runtime JSON parser.
- [x] 2.3 Show parse errors without hiding validation feedback or crashing the panel.
- [x] 2.4 Wire reset and copy buttons to workbench state actions and disable them when no case is selected.

## 3. Workbench Integration

- [x] 3.1 Verify `WorkbenchApp.vue` passes editor state, parse error, validation result, and actions into `RightPanel.vue`.
- [x] 3.2 Verify `PreviewArea.vue` receives `currentProps` rather than selected variant props directly.
- [x] 3.3 Confirm case and variant selection changes reset edited props and clear stale editor errors.

## 4. Verification

- [x] 4.1 Add or update focused tests for valid JSON edits, invalid JSON behavior, reset, and copy props if the current test setup supports it.
- [x] 4.2 Run `npm run typecheck`.
- [x] 4.3 Run `npm run build`.
- [x] 4.4 Run `openspec status --change add-json-props-editor`.

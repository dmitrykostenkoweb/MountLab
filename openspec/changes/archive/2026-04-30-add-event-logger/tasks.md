## 1. Preview Event Capture

- [x] 1.1 Build `PreviewArea` event handlers from `selectedCase.events`.
- [x] 1.2 Normalize emitted payloads so zero args log `undefined`, one arg logs the value, and multiple args log an array.
- [x] 1.3 Emit captured event name and normalized payload from `PreviewArea` to the workbench.

## 2. Runtime Event Log State

- [x] 2.1 Add runtime event log entries containing id, event name, timestamp, and payload.
- [x] 2.2 Add an action to append captured events to the log.
- [x] 2.3 Add an action to clear the event log.
- [x] 2.4 Clear stale event log entries when the selected case changes.

## 3. Right Panel UI

- [x] 3.1 Render configured event names in the right panel.
- [x] 3.2 Render captured event log entries with event name, timestamp, and formatted payload.
- [x] 3.3 Add a clear log button and disable it when there are no entries.

## 4. Workbench Integration

- [x] 4.1 Pass selected case event names into `PreviewArea`.
- [x] 4.2 Wire captured preview events to the runtime event log action.
- [x] 4.3 Pass event log entries and clear action into `RightPanel`.

## 5. Verification

- [x] 5.1 Verify configured emitted events appear in the right panel with name, payload, and timestamp.
- [x] 5.2 Verify clear removes current event log entries.
- [x] 5.3 Verify changing case clears stale event log entries.
- [x] 5.4 Run `npm run typecheck`.
- [x] 5.5 Run `npm run build`.
- [x] 5.6 Run `openspec status --change add-event-logger`.

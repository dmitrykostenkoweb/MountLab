## Context

The runtime workbench already routes selected case metadata, selected variant props, and right-panel state through `useWorkbenchState`. Event logging belongs in the same runtime-only flow: `PreviewArea` can translate configured event names into Vue listeners, the composable can own the log entries, and `RightPanel` can display and clear them.

The feature is local developer tooling. It does not require changes to case files beyond using the existing `events` field, and it does not require persistence, URL serialization, CLI changes, or package export changes.

## Goals / Non-Goals

**Goals:**

- Create preview event handlers for every event name configured on the selected case.
- Capture emitted event name, normalized payload, and timestamp.
- Store event log entries in runtime workbench state.
- Render configured event names and captured entries in the right panel.
- Provide a clear log action.
- Clear stale event entries when the selected case changes.

**Non-Goals:**

- Infer emitted events automatically from components.
- Persist event entries across reloads or encode them in the URL.
- Capture events that are not listed in the selected case `events`.
- Change the public case authoring API.

## Decisions

1. Build handlers in `PreviewArea` from `selectedCase.events`.

   `PreviewArea` is the component that mounts the selected component, so it is the narrowest place to turn event names into Vue listeners. It should emit a single normalized `eventCaptured` event upward instead of owning log state.

   Alternative considered: register listeners in `WorkbenchApp.vue`. That would make the mounting template more complex and duplicate preview-specific event payload handling outside the preview boundary.

2. Keep event log state in `useWorkbenchState`.

   The log is part of runtime selection state, alongside current props and selected case/variant. Keeping it in the composable lets selection changes clear stale entries without coupling the right panel to selection rules.

   Alternative considered: local `RightPanel.vue` state. That would make entries harder to clear reliably when the selection changes and would split state ownership.

3. Normalize payloads by event argument count.

   Events with no args should log `undefined`, events with one arg should log that arg, and events with multiple args should log the args array. This preserves the useful emitted data while avoiding an artificial wrapper shape for common single-payload events.

   Alternative considered: always log an array of args. That is mechanically simpler but noisier for the common single-payload case.

4. Clear entries on case and variant selection resets, while wrapper-only changes keep the log.

   Case and variant changes represent a different component exercise context. Wrapper changes do not change the selected component event contract, so clearing there would be unnecessarily destructive.

   Alternative considered: clear only on case changes. That would preserve more data, but variant changes can also represent a different scenario and stale entries would be misleading.

## Risks / Trade-offs

- High-volume events can grow the in-memory log quickly -> Keep the log local and clearable; avoid persistence.
- Payloads may not be JSON-serializable -> Format display defensively and fall back to `String(payload)`.
- Components may emit events not listed in `events` -> Only configured events are captured, matching the case author's explicit contract.

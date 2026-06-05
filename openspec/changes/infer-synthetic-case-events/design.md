## Context

MountLab event logging is intentionally driven by `ComponentCase.events`: the preview only attaches listeners for configured event names, and the right panel renders the resulting log. That works for authored cases, but auto-discovered synthetic cases are generated from raw `.vue` files with only a default variant and no event metadata.

The playground now uses `components: ['src/components/**/*.vue']` and no longer has `ProductCard.case.ts`, so `ProductCard.vue` still renders but its `select` and `restock` emits are invisible to the Events tab.

## Goals / Non-Goals

**Goals:**

- Infer event names for synthetic cases from common static `defineEmits` forms in Vue SFC `<script setup>`.
- Feed inferred names into the existing `events` field so runtime event capture remains unchanged.
- Keep authored sidecar cases authoritative when present.
- Make the no-events state in the Events tab explicit enough that synthetic cases without inferred events do not look like a broken logger.

**Non-Goals:**

- Infer event names from runtime behavior.
- Resolve imported TypeScript types or external declarations.
- Support every possible JavaScript expression passed to `defineEmits`.
- Change the public `ComponentCase` contract or require users to opt into a new config field.

## Decisions

1. Parse event names inside the plugin when generating synthetic cases.

   The plugin already reads component paths and emits the synthetic `ComponentCase` object, so it is the narrowest place to add `events`. Runtime code should keep treating authored and synthetic cases the same once the generated registry is loaded.

   Alternative considered: infer events in the runtime from the imported component. Vue does not expose a consistent runtime emits list for all `<script setup>` type-only emits, and doing this in the browser would duplicate work for every reload.

2. Support static `defineEmits` shapes first.

   The implementation should support:

   - `defineEmits(['select', 'restock'])`
   - `defineEmits<{ select: [payload: Payload]; restock: [] }>()`
   - `defineEmits<{ (event: 'select', payload: Payload): void; (event: 'restock'): void }>()`

   If the expression is dynamic, imported, or otherwise unreadable, the synthetic case should omit `events` instead of guessing.

   Alternative considered: add a full AST parser dependency. For this slice, SFC-level extraction plus conservative parsing is enough and avoids increasing package weight.

3. Preserve authored case precedence.

   Existing sidecar suppression remains the authority boundary. If `ProductCard.case.ts` exists, the authored case controls `events`; inferred events for `ProductCard.vue` are not generated because no synthetic case is generated.

4. Keep event logging runtime behavior unchanged.

   `WorkbenchApp` should continue passing `selectedCase.events ?? []` into `PreviewArea`, and `PreviewArea` should continue normalizing payloads. The runtime change is limited to the empty-state copy/branch in `RightPanel`.

5. Make inference failure non-fatal.

   A malformed or unsupported `defineEmits` declaration should not block component discovery. It should result in no inferred event names, matching the current synthetic-case behavior.

## Risks / Trade-offs

- [Risk] Conservative parsing misses valid Vue emit declarations. -> Mitigation: document supported static forms in tests and keep authored cases as the escape hatch.
- [Risk] String matching could accidentally capture unrelated type literals. -> Mitigation: scope extraction to the `defineEmits` call content and deduplicate event names.
- [Risk] Event names such as `update:modelValue` need punctuation support. -> Mitigation: treat string-literal event names as opaque names and preserve them exactly.
- [Risk] The Events tab may still be empty for type declarations imported from another file. -> Mitigation: show an explicit no-configured-events state and avoid claiming inference is exhaustive.

## Migration Plan

No migration is required. Existing authored cases continue to work. Synthetic cases with readable `defineEmits` declarations gain `events` automatically after the plugin reloads.

Rollback is contained to removing the event inference helper and reverting the generated synthetic case object to omit `events`.

## Open Questions

- Should unsupported dynamic `defineEmits` forms produce a developer-facing warning, or is the Events-tab empty state enough for the first implementation?

## 1. Plugin Event Inference

- [x] 1.1 Add focused plugin tests for synthetic cases generated from `defineEmits(['select', 'restock'])`.
- [x] 1.2 Add focused plugin tests for type-literal `defineEmits` event names, including `update:modelValue`.
- [x] 1.3 Add focused plugin tests showing unsupported or dynamic `defineEmits` forms do not fail component discovery.
- [x] 1.4 Add focused plugin tests showing authored sidecar cases suppress synthetic event inference.
- [x] 1.5 Implement conservative SFC `defineEmits` extraction for supported static forms.
- [x] 1.6 Include inferred event names in generated synthetic `ComponentCase.events` only when at least one event is found.

## 2. Runtime Empty State

- [x] 2.1 Update the Events tab empty state to distinguish no configured or inferred event names from no recorded events.
- [x] 2.2 Add or update focused runtime coverage for the no-event-names state and the configured-but-empty event log state.

## 3. Playground Verification

- [x] 3.1 Verify the playground `ProductCard.vue` synthetic case lists inferred `select` and `restock` events.
- [x] 3.2 Verify clicking the playground ProductCard actions records event names and payloads in the Events tab.

## 4. Validation

- [x] 4.1 Run focused plugin and runtime tests.
- [x] 4.2 Run `npm run typecheck`.
- [x] 4.3 Run `npm run build:runtime`.
- [x] 4.4 Run `openspec validate infer-synthetic-case-events --strict`.

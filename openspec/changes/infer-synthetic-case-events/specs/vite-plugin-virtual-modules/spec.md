## ADDED Requirements

### Requirement: Synthetic case events are inferred from Vue emits
The Vite plugin SHALL include statically inferred event names on synthetic component cases when those names can be read from the discovered Vue component file.

#### Scenario: Array defineEmits creates synthetic events
- **WHEN** `config.components` includes `src/components/**/*.vue`
- **AND** `src/components/ProductCard.vue` exists without an authored sidecar case
- **AND** the component declares `defineEmits(['select', 'restock'])`
- **THEN** the generated synthetic case for `ProductCard.vue` SHALL include `events: ['select', 'restock']`

#### Scenario: Type literal defineEmits creates synthetic events
- **WHEN** a discovered Vue component without an authored sidecar case declares static event names in a `defineEmits` type literal
- **THEN** the generated synthetic case SHALL include those event names in `events`
- **AND** event names containing punctuation such as `update:modelValue` SHALL be preserved exactly

#### Scenario: Unsupported emits inference is non-fatal
- **WHEN** a discovered Vue component without an authored sidecar case uses an unsupported or dynamic `defineEmits` declaration
- **THEN** the generated synthetic case SHALL still be included
- **AND** the synthetic case SHALL omit `events`
- **AND** loading `virtual:mountlab/cases` SHALL NOT fail because event inference was unsupported

#### Scenario: Authored sidecar events remain authoritative
- **WHEN** `src/components/ProductCard.vue` exists
- **AND** `src/components/ProductCard.case.ts` exists
- **THEN** the generated registry SHALL include the authored case
- **AND** it SHALL NOT generate or merge inferred events from `ProductCard.vue` into the authored case

## MODIFIED Requirements

### Requirement: virtual:mountlab/cases module
The plugin SHALL handle the virtual module ID `virtual:mountlab/cases`.

#### Scenario: resolveId maps virtual ID
- **WHEN** Vite tries to resolve `virtual:mountlab/cases`
- **THEN** the plugin SHALL return `'\0virtual:mountlab/cases'` (Vite convention for virtual modules)

#### Scenario: load returns cases array
- **WHEN** Vite loads `'\0virtual:mountlab/cases'`
- **THEN** the plugin SHALL return valid JavaScript exporting a `cases` constant
  - **MVP stub**: `export const cases = []`
  - **Full implementation**: an array of validated authored cases matching `config.cases` globs plus synthetic cases for discovered Vue components matching `config.components` globs that do not have authored sidecar cases

#### Scenario: Unknown IDs are not intercepted
- **WHEN** Vite resolves any ID other than `virtual:mountlab/cases` or `virtual:mountlab/config`
- **THEN** the plugin SHALL return `undefined` from `resolveId` (pass-through)

#### Scenario: Case paths are deterministic
- **WHEN** the plugin resolves case files from configured glob patterns and component files from configured component glob patterns
- **THEN** the generated cases registry SHALL use a stable sorted order

#### Scenario: Invalid case object is rejected
- **WHEN** a discovered case module default export is not an object-like value with a non-empty string `id`, a present `component`, and a `variants` array
- **THEN** loading `virtual:mountlab/cases` SHALL throw a readable MountLab error
- **AND** the error SHALL include the source case file path

#### Scenario: Duplicate case ID is rejected
- **WHEN** two or more discovered authored or synthetic cases define the same `id`
- **THEN** loading `virtual:mountlab/cases` SHALL throw a readable MountLab error naming the duplicate ID
- **AND** the error SHALL include all source paths involved in the duplicate

#### Scenario: Valid discovered cases are exported
- **WHEN** all discovered authored and synthetic cases have valid required fields and unique IDs
- **THEN** `virtual:mountlab/cases` SHALL export a `cases` array containing the validated case objects

### Requirement: Discovered case metadata is exposed to runtime
The Vite plugin SHALL expose source path metadata for discovered cases to the runtime without requiring users to add path fields to authored case files.

#### Scenario: Case entry includes diagnostic path
- **WHEN** a case file is discovered from `src/components/ProductCard.case.ts`
- **THEN** the generated runtime registry SHALL include the validated case object
- **AND** it SHALL include the relative diagnostic path for that case

#### Scenario: Synthetic component entry includes diagnostic path
- **WHEN** a Vue component file is discovered from `src/components/ProductCard.vue` without an authored sidecar case
- **THEN** the generated runtime registry SHALL include a synthetic case object for that component
- **AND** it SHALL include the relative diagnostic path for the component file

#### Scenario: Authored case object is not mutated
- **WHEN** the plugin attaches source path metadata for runtime use
- **THEN** it SHALL NOT require the authored default export to include a `path` property
- **AND** it SHALL NOT weaken existing validation for `id`, `component`, or `variants`

#### Scenario: Case metadata order is deterministic
- **WHEN** the plugin resolves case files from configured glob patterns and component files from configured component glob patterns
- **THEN** the generated runtime metadata entries SHALL use the same stable sorted order as discovered cases

#### Scenario: Metadata supports duplicate diagnostics
- **WHEN** duplicate case IDs are detected
- **THEN** the duplicate error SHALL continue to include all source paths involved

## ADDED Requirements

### Requirement: Vue components can produce synthetic cases
The Vite plugin SHALL generate synthetic component cases for configured Vue component files that do not have authored sidecar case files.

#### Scenario: Component without case file appears in registry
- **WHEN** `config.components` includes `src/components/**/*.vue`
- **AND** `src/components/ProductCard.vue` exists
- **AND** `src/components/ProductCard.case.ts` does not exist
- **THEN** `virtual:mountlab/cases` SHALL include a synthetic case for `ProductCard.vue`
- **AND** the synthetic case SHALL include a stable kebab-case `id`, a human-readable `title`, the Vue component, and one `default` variant

#### Scenario: Authored sidecar case wins
- **WHEN** `src/components/ProductCard.vue` exists
- **AND** `src/components/ProductCard.case.ts` exists
- **THEN** the generated registry SHALL include the authored case
- **AND** it SHALL NOT include a separate synthetic case for `ProductCard.vue`

#### Scenario: Index component sidecar matching
- **WHEN** `src/components/product-card/index.vue` exists
- **AND** `src/components/product-card/ProductCard.case.ts` exists
- **THEN** the generated registry SHALL treat the authored case as the sidecar for the index component
- **AND** it SHALL NOT include a separate synthetic case for `index.vue`

#### Scenario: Synthetic case uses empty default props
- **WHEN** the plugin generates a synthetic case for a Vue component
- **THEN** the synthetic case's default variant SHALL use an empty props object
- **AND** the plugin SHALL NOT require TypeScript props inference to succeed

#### Scenario: Component discovery is opt-in
- **WHEN** `config.components` is omitted
- **THEN** the plugin SHALL NOT discover raw `.vue` files as synthetic cases
- **AND** existing `config.cases` discovery behavior SHALL continue to work

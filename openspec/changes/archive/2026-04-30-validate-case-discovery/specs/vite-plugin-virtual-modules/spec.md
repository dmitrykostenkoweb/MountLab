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
  - **Full implementation**: an array of dynamic imports for all resolved `*.case.ts` files matching `config.cases` globs

#### Scenario: Unknown IDs are not intercepted
- **WHEN** Vite resolves any ID other than `virtual:mountlab/cases` or `virtual:mountlab/config`
- **THEN** the plugin SHALL return `undefined` from `resolveId` (pass-through)

#### Scenario: Case paths are deterministic
- **WHEN** the plugin resolves case files from configured glob patterns
- **THEN** the generated cases registry SHALL use a stable sorted case path order

#### Scenario: Invalid case object is rejected
- **WHEN** a discovered case module default export is not an object-like value with a non-empty string `id`, a present `component`, and a `variants` array
- **THEN** loading `virtual:mountlab/cases` SHALL throw a readable MountLab error
- **AND** the error SHALL include the source case file path

#### Scenario: Duplicate case ID is rejected
- **WHEN** two or more discovered case modules define the same `id`
- **THEN** loading `virtual:mountlab/cases` SHALL throw a readable MountLab error naming the duplicate ID
- **AND** the error SHALL include all source case file paths involved in the duplicate

#### Scenario: Valid discovered cases are exported
- **WHEN** all discovered case modules have valid required fields and unique IDs
- **THEN** `virtual:mountlab/cases` SHALL export a `cases` array containing the validated case objects

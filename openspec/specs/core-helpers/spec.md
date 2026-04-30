# core-helpers Specification

## Purpose
Identity helper functions that provide full TypeScript inference when defining MountLab configuration and component cases. These are the primary user-facing API of the package.

## Requirements

### Requirement: defineMountLabConfig helper
The package SHALL export a `defineMountLabConfig(config: MountLabConfig): MountLabConfig` function.

#### Scenario: Returns config unchanged
- **WHEN** `defineMountLabConfig({ port: 5000 })` is called
- **THEN** the returned value SHALL equal the input object (identity function)

#### Scenario: Provides TypeScript inference
- **WHEN** a user writes `defineMountLabConfig({ port: 'wrong' })`
- **THEN** TypeScript SHALL report a type error (port must be number)

#### Scenario: Exported from package root
- **WHEN** a user imports from `@mountlab/vue`
- **THEN** `defineMountLabConfig` SHALL be available as a named export

---

### Requirement: defineComponentCase helper
The package SHALL export a `defineComponentCase<TProps>(componentCase: ComponentCase<TProps>): ComponentCase<TProps>` generic function.

#### Scenario: Returns case unchanged
- **WHEN** `defineComponentCase({ id: 'x', component: MyComp, variants: [] })` is called
- **THEN** the returned value SHALL equal the input object (identity function)

#### Scenario: TProps is inferred from variants
- **WHEN** a user writes:
  ```ts
  defineComponentCase({
    id: 'card',
    component: MyCard,
    variants: [{ id: 'default', props: { label: 'Save' } }],
  })
  ```
- **THEN** TypeScript SHALL infer `TProps` as `{ label: string }` without explicit annotation

#### Scenario: Type error on wrong prop type
- **WHEN** a user provides a variant with props that don't match the inferred `TProps`
- **THEN** TypeScript SHALL report a type error

#### Scenario: Exported from package root
- **WHEN** a user imports from `@mountlab/vue`
- **THEN** `defineComponentCase` SHALL be available as a named export

#### Scenario: Exported from @mountlab/vue/core subpath
- **WHEN** a user imports from `@mountlab/vue/core`
- **THEN** `defineComponentCase` and `defineMountLabConfig` SHALL both be available

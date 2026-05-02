# core-types Specification

## Purpose
TypeScript interface definitions for all core MountLab domain objects: configuration, component cases, variants, and viewports. These types are the shared contract between the CLI, Vite plugin, and runtime UI.
## Requirements
### Requirement: MountLabConfig interface
The package SHALL export a `MountLabConfig` interface describing the full configuration object accepted by `defineMountLabConfig`.

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `port` | `number` | No | `4300` |
| `cases` | `string[]` | No | `['src/**/*.case.ts']` |
| `setupApp` | `(app: App) => void \| Promise<void>` | No | — |
| `wrappers` | `Record<string, Component>` | No | — |
| `defaultWrapper` | `string` | No | — |
| `viewports` | `Record<string, Viewport \| null>` | No | — |

#### Scenario: All fields are optional
- **WHEN** a user provides an empty object `{}`
- **THEN** TypeScript SHALL not report a type error for `MountLabConfig`

#### Scenario: setupApp receives Vue App instance
- **WHEN** `setupApp` is defined
- **THEN** the parameter type SHALL be `App` from `vue`

#### Scenario: wrappers values are Vue components
- **WHEN** `wrappers` is defined
- **THEN** each value SHALL be typed as `Component` from `vue`

---

### Requirement: ComponentCase interface
The package SHALL export a generic `ComponentCase<TProps>` interface describing a component workbench case.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `title` | `string` | No |
| `group` | `string` | No |
| `component` | `Component` | Yes |
| `wrapper` | `string` | No |
| `propsSchema` | `unknown` | No |
| `variants` | `ComponentVariant<TProps>[]` | Yes |
| `events` | `string[]` | No |
| `notes` | `string` | No |

#### Scenario: id is required
- **WHEN** a user omits `id` from a ComponentCase object
- **THEN** TypeScript SHALL report a type error

#### Scenario: variants is required
- **WHEN** a user omits `variants` from a ComponentCase object
- **THEN** TypeScript SHALL report a type error

#### Scenario: Generic TProps flows to variants
- **WHEN** `ComponentCase<{ label: string }>` is used
- **THEN** `variants[n].props` SHALL be typed as `{ label: string } | undefined`

#### Scenario: propsSchema is schema-agnostic
- **WHEN** `propsSchema` is provided
- **THEN** the type SHALL be `unknown`, allowing Zod, Valibot, or any schema object

---

### Requirement: ComponentVariant interface
The package SHALL export a generic `ComponentVariant<TProps>` interface.

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | Yes |
| `title` | `string` | No |
| `props` | `TProps` | No |
| `notes` | `string` | No |

#### Scenario: id is required
- **WHEN** a user omits `id` from a ComponentVariant object
- **THEN** TypeScript SHALL report a type error

---

### Requirement: Viewport interface
The package SHALL export a `Viewport` interface for named viewport presets.

| Field | Type | Required |
|-------|------|----------|
| `width` | `number` | Yes |
| `height` | `number` | Yes |

#### Scenario: Viewport null is allowed in config
- **WHEN** `viewports` contains a key mapped to `null`
- **THEN** TypeScript SHALL not report a type error (represents "auto/unconstrained" preset)

---

### Requirement: All types are re-exported from package root
The package root SHALL re-export all public MountLab core types needed by user-authored config and case files.

#### Scenario: Root type exports are available
- **WHEN** a user imports from `@mountlab/vue`
- **THEN** `MountLabConfig`, `ComponentCase`, `ComponentVariant`, and `Viewport` SHALL be available as named type exports

### Requirement: Viewport config semantics
The `MountLabConfig.viewports` field SHALL define named runtime viewport presets where each key maps to fixed dimensions or to `null` for unconstrained auto preview mode.

#### Scenario: Fixed viewport preset
- **WHEN** `viewports` contains `{ mobile: { width: 390, height: 844 } }`
- **THEN** the runtime SHALL treat `mobile` as a selectable fixed-size viewport preset

#### Scenario: Null viewport preset
- **WHEN** `viewports` contains `{ auto: null }`
- **THEN** the runtime SHALL treat `auto` as a selectable unconstrained preview preset

#### Scenario: Viewports remain optional
- **WHEN** `viewports` is omitted from `MountLabConfig`
- **THEN** TypeScript SHALL still accept the config
- **AND** runtime behavior SHALL provide a built-in unconstrained preview mode

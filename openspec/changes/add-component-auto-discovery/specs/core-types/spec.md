## MODIFIED Requirements

### Requirement: MountLabConfig interface
The package SHALL export a `MountLabConfig` interface describing the full configuration object accepted by `defineMountLabConfig`.

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `port` | `number` | No | `4300` |
| `cases` | `string[]` | No | `['src/**/*.case.ts']` |
| `components` | `string[]` | No | — |
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

#### Scenario: components accepts Vue component globs
- **WHEN** `components` is defined as an array of glob patterns such as `['src/components/**/*.vue']`
- **THEN** TypeScript SHALL not report a type error for `MountLabConfig`

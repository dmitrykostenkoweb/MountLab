# vite-plugin-virtual-modules Specification

## Purpose
The Vite plugin `mountlab()` that registers two virtual modules used by the runtime UI and handles future middleware injection. Currently the virtual modules return stubs; this spec describes the resolved contract including the full implementation target.

## Requirements

### Requirement: Plugin factory export
The package SHALL export a `mountlab(config?: MountLabConfig): Plugin` function from `@mountlab/vue/plugin`.

#### Scenario: Plugin is a valid Vite plugin
- **WHEN** `mountlab()` is called
- **THEN** the returned object SHALL have a `name` field equal to `'mountlab'`

#### Scenario: Config is optional
- **WHEN** `mountlab()` is called with no arguments
- **THEN** the plugin SHALL not throw; it SHALL apply defaults (port = 4300)

---

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

---

### Requirement: virtual:mountlab/config module
The plugin SHALL handle the virtual module ID `virtual:mountlab/config`.

#### Scenario: resolveId maps virtual ID
- **WHEN** Vite tries to resolve `virtual:mountlab/config`
- **THEN** the plugin SHALL return `'\0virtual:mountlab/config'`

#### Scenario: load serializes safe config fields
- **WHEN** Vite loads `'\0virtual:mountlab/config'`
- **THEN** the plugin SHALL return valid JavaScript exporting a `config` object
- **AND** the object SHALL include at minimum `{ port: number }` (serializable fields only — Vue Component objects are NOT serialized)

#### Scenario: Default port is 4300
- **WHEN** `config.port` is not provided
- **THEN** the exported `config.port` SHALL equal `4300`

---

### Requirement: Plugin lifecycle hooks are present
#### Scenario: configResolved hook exists
- **WHEN** Vite calls the plugin's `configResolved` hook
- **THEN** the plugin SHALL not throw (hook may be a no-op in MVP)

#### Scenario: configureServer hook exists
- **WHEN** Vite calls the plugin's `configureServer` hook
- **THEN** the plugin SHALL not throw (hook may be a no-op in MVP; full implementation will serve runtime UI)

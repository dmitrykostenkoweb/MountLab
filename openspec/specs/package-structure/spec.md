# package-structure Specification

## Purpose
The npm package shape for `@mountlab/vue`: binary entrypoint, subpath exports, peer dependencies, build output, and public API surface.

## Requirements

### Requirement: Package name and CLI binary
The package SHALL be published as `@mountlab/vue` and SHALL provide a `mountlab` CLI binary.

#### Scenario: Binary is accessible after install
- **WHEN** `@mountlab/vue` is installed as a dev dependency
- **THEN** `pnpm mountlab` (or `npx mountlab`) SHALL invoke `dist/cli/index.js`

#### Scenario: Package is ESM
- **WHEN** the package is loaded
- **THEN** all exports SHALL be ES modules (`"type": "module"` in package.json)

---

### Requirement: Subpath exports
The package SHALL expose three subpath exports:

| Export path | Purpose |
|-------------|---------|
| `@mountlab/vue` | Main entry — re-exports core helpers and types |
| `@mountlab/vue/core` | Core helpers and types only |
| `@mountlab/vue/plugin` | Vite plugin only |

#### Scenario: Main export provides helpers
- **WHEN** `import { defineMountLabConfig, defineComponentCase } from '@mountlab/vue'`
- **THEN** both functions SHALL be available

#### Scenario: Main export provides types
- **WHEN** `import type { MountLabConfig, ComponentCase, ComponentVariant, Viewport } from '@mountlab/vue'`
- **THEN** all four types SHALL be available

#### Scenario: Plugin subpath does not pull in CLI
- **WHEN** `import { mountlab } from '@mountlab/vue/plugin'`
- **THEN** only the Vite plugin factory function and `MountLabConfig` type SHALL be available

---

### Requirement: Peer dependencies
Vue and Vite SHALL be peer dependencies, not bundled.

#### Scenario: Vue is optional peer
- **WHEN** the package is used in a CLI-only context without Vue
- **THEN** npm SHALL not report a missing peer dependency error
  (`peerDependenciesMeta.vue.optional = true`)

#### Scenario: Vite is optional peer
- **WHEN** the package is used without a Vite project
- **THEN** npm SHALL not report a missing peer dependency error
  (`peerDependenciesMeta.vite.optional = true`)

#### Scenario: Minimum Vite version
- **WHEN** checking peer constraints
- **THEN** the package SHALL require `vite >= 5.0.0`

#### Scenario: Minimum Vue version
- **WHEN** checking peer constraints
- **THEN** the package SHALL require `vue >= 3.4.0`

---

### Requirement: Build output
The package SHALL be built with `tsup` and output to `dist/`.

#### Scenario: dist is the published directory
- **WHEN** the package is published
- **THEN** only the `dist/` directory SHALL be included (`"files": ["dist"]`)

#### Scenario: TypeScript declarations are included
- **WHEN** a consumer imports from `@mountlab/vue`
- **THEN** `.d.ts` declaration files SHALL be available for all exported subpaths

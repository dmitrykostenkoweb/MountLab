# cli-structure Specification

## Purpose
The Commander.js-based CLI binary that provides the `mountlab` command with subcommands `init`, `add`, and `dev`.

## Requirements

### Requirement: CLI binary name and version
The binary SHALL be named `mountlab` and SHALL report a version.

#### Scenario: --version flag
- **WHEN** `mountlab --version` is run
- **THEN** the output SHALL print the current package version

#### Scenario: --help flag
- **WHEN** `mountlab --help` is run
- **THEN** the output SHALL list available commands and the description "Component workbench for Vue 3 + Vite"

---

### Requirement: init subcommand is registered
The CLI SHALL register an `init` subcommand.

#### Scenario: init is callable
- **WHEN** `mountlab init` is run
- **THEN** the `runInit` handler SHALL be invoked

#### Scenario: init --dry-run flag
- **WHEN** `mountlab init --dry-run` is run
- **THEN** `runInit` SHALL be called with `{ dryRun: true, force: false }`

#### Scenario: init --force flag
- **WHEN** `mountlab init --force` is run
- **THEN** `runInit` SHALL be called with `{ dryRun: false, force: true }`

---

### Requirement: add subcommand is registered
The CLI SHALL register an `add <component-path>` subcommand.

#### Scenario: add is callable with a path argument
- **WHEN** `mountlab add src/components/MyComp.vue` is run
- **THEN** `runAdd` SHALL be invoked with `'src/components/MyComp.vue'` as the first argument

---

### Requirement: dev subcommand is registered
The CLI SHALL register a `dev` subcommand.

#### Scenario: dev is callable
- **WHEN** `mountlab dev` is run
- **THEN** `runDev` SHALL be invoked

---

### Requirement: Unknown commands produce an error
#### Scenario: Unrecognized subcommand
- **WHEN** `mountlab unknown-command` is run
- **THEN** Commander SHALL print an error message and exit with a non-zero code

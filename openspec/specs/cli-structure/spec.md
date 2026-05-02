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
The CLI SHALL reject unknown commands with a non-zero exit and a readable Commander error.

#### Scenario: Unrecognized subcommand
- **WHEN** `mountlab unknown-command` is run
- **THEN** Commander SHALL print an error message and exit with a non-zero code

### Requirement: dev supports --open option
The CLI SHALL register an `--open` option for the `dev` subcommand that requests opening the workbench URL after the dev server starts.

#### Scenario: dev --open is accepted
- **WHEN** `mountlab dev --open` is run
- **THEN** Commander SHALL accept the option
- **AND** the `runDev` handler SHALL receive an option indicating that the browser should be opened

#### Scenario: dev without --open keeps default behavior
- **WHEN** `mountlab dev` is run without `--open`
- **THEN** the dev server SHALL start without requesting browser opening

#### Scenario: open failure is non-fatal
- **WHEN** `mountlab dev --open` starts the server but the environment cannot open a browser
- **THEN** the command SHALL keep the dev server running
- **AND** it SHALL print or preserve the workbench URL for manual opening

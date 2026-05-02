## Purpose

Repository-level verification commands used during MountLab development.
## Requirements
### Requirement: Repository type-check command succeeds
The repository SHALL provide a working type-check command that validates the current TypeScript source tree without emitting files.

#### Scenario: Type-check passes
- **WHEN** `npm run typecheck` is run from the package root
- **THEN** the command SHALL exit successfully
- **AND** TypeScript SHALL resolve runtime Vue single-file component imports used by the source tree

### Requirement: Package build remains successful
The repository SHALL preserve the existing package build behavior while adding type-check support.

#### Scenario: Build passes after stabilization
- **WHEN** `npm run build` is run from the package root
- **THEN** the command SHALL exit successfully
- **AND** the runtime build SHALL still produce the runtime bundle

### Requirement: Runtime source hygiene is maintained
The runtime source SHALL avoid unused imports introduced or left behind by stabilization work.

#### Scenario: Runtime imports are cleaned up
- **WHEN** runtime source files are reviewed after stabilization
- **THEN** imports that are not used by the file SHALL be removed
- **AND** runtime behavior SHALL remain unchanged

### Requirement: Stabilization does not change public behavior
The stabilization SHALL NOT change user-facing CLI commands, core helper APIs, plugin APIs, or runtime feature behavior.

#### Scenario: Public behavior remains scoped
- **WHEN** the stabilization is complete
- **THEN** no CLI command contract SHALL change
- **AND** no package export contract SHALL change
- **AND** no new runtime user workflow SHALL be introduced

### Requirement: CLI behavior is covered by tests
The repository SHALL include focused verification for CLI command registration and option wiring that are part of the MountLab developer workflow.

#### Scenario: dev open option is verified
- **WHEN** the CLI verification suite runs
- **THEN** it SHALL verify that `mountlab dev --open` is accepted and forwarded to the dev command handler

#### Scenario: existing CLI options remain verified
- **WHEN** the CLI verification suite runs
- **THEN** it SHALL verify existing `init` and `add` option wiring for dry-run, force, group, and wrapper behavior

### Requirement: Runtime PRD workflows are covered by tests
The repository SHALL include runtime verification for state and UI behavior that supports PRD-critical workbench workflows.

#### Scenario: URL and viewport state are verified
- **WHEN** runtime state tests run
- **THEN** they SHALL cover case, variant, wrapper, and viewport URL restoration and synchronization

#### Scenario: Sidebar behavior is verified
- **WHEN** runtime sidebar tests run
- **THEN** they SHALL cover explicit grouping, path fallback grouping, and search filtering

#### Scenario: Right panel behavior remains verified
- **WHEN** runtime right-panel tests run
- **THEN** they SHALL cover props JSON editing, invalid JSON handling, schema validation, event logging, and copy actions

### Requirement: Case discovery behavior is covered by tests
The repository SHALL include verification for virtual case discovery behavior used by the runtime.

#### Scenario: Case metadata is verified
- **WHEN** plugin discovery tests run
- **THEN** they SHALL verify that discovered case registry output includes source path metadata for runtime use

#### Scenario: Discovery diagnostics remain verified
- **WHEN** plugin discovery tests run
- **THEN** they SHALL verify invalid case diagnostics and duplicate case ID diagnostics

### Requirement: Real workflow smoke path is documented or automated
The repository SHALL provide a lightweight smoke path for validating `init`, `add`, and `dev` against a minimal Vue/Vite project.

#### Scenario: Smoke path exists
- **WHEN** a maintainer needs to validate the full MountLab workflow
- **THEN** the repository SHALL provide either an automated smoke test or documented smoke fixture steps for `mountlab init`, `mountlab add`, and `mountlab dev`

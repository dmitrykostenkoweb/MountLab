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

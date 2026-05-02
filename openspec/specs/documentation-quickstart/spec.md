# documentation-quickstart Specification

## Purpose
TBD - created by archiving change complete-prd-gap-backlog. Update Purpose after archive.
## Requirements
### Requirement: README reflects current product status
The README SHALL describe the current implemented MountLab workflow and SHALL NOT present the package as only a Phase 1 skeleton once runtime, CLI, and Vite integration are implemented.

#### Scenario: Status is current
- **WHEN** a developer opens the README
- **THEN** the README SHALL describe MountLab as a local Vue/Vite component workbench with implemented CLI and runtime workflow
- **AND** it SHALL NOT claim that only API types and the CLI entrypoint are defined

### Requirement: Quick start documents the working flow
The README SHALL include a concise quick start that covers install, init, add, and dev commands.

#### Scenario: Quick start includes core commands
- **WHEN** a developer reads the quick start
- **THEN** it SHALL show commands for installing `@mountlab/vue`, running `mountlab init`, running `mountlab add <component-path>`, and running `mountlab dev`

#### Scenario: Quick start mentions workbench URL
- **WHEN** a developer reads the quick start
- **THEN** it SHALL state that the workbench opens on the configured port, defaulting to `http://localhost:4300`

### Requirement: Documentation separates implemented features from roadmap
The README SHALL distinguish currently implemented MVP behavior from future roadmap items.

#### Scenario: Implemented features are listed
- **WHEN** a developer reads the README
- **THEN** it SHALL mention implemented support for case files, variants, wrappers, props JSON editing, optional schema validation, event logging, and URL state

#### Scenario: Future features are not implied as implemented
- **WHEN** a roadmap or limitations section mentions future features
- **THEN** it SHALL clearly indicate that features such as static publishing, visual regression, screenshot testing, and AI fixture generation are not part of the current MVP

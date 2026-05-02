## ADDED Requirements

### Requirement: Discovered case metadata is exposed to runtime
The Vite plugin SHALL expose source path metadata for discovered cases to the runtime without requiring users to add path fields to authored case files.

#### Scenario: Case entry includes diagnostic path
- **WHEN** a case file is discovered from `src/components/ProductCard.case.ts`
- **THEN** the generated runtime registry SHALL include the validated case object
- **AND** it SHALL include the relative diagnostic path for that case

#### Scenario: Authored case object is not mutated
- **WHEN** the plugin attaches source path metadata for runtime use
- **THEN** it SHALL NOT require the authored default export to include a `path` property
- **AND** it SHALL NOT weaken existing validation for `id`, `component`, or `variants`

#### Scenario: Case metadata order is deterministic
- **WHEN** the plugin resolves case files from configured glob patterns
- **THEN** the generated runtime metadata entries SHALL use the same stable sorted order as discovered cases

#### Scenario: Metadata supports duplicate diagnostics
- **WHEN** duplicate case IDs are detected
- **THEN** the duplicate error SHALL continue to include all source case file paths involved

## MODIFIED Requirements

### Requirement: Plugin lifecycle hooks are present
The plugin SHALL expose lifecycle hooks needed to integrate the MountLab runtime with a Vite development server.

#### Scenario: configResolved hook exists
- **WHEN** Vite calls the plugin's `configResolved` hook
- **THEN** the plugin SHALL not throw

#### Scenario: configureServer hook exists
- **WHEN** Vite calls the plugin's `configureServer` hook
- **THEN** the plugin SHALL not throw
- **AND** the hook SHALL be able to serve the MountLab runtime UI

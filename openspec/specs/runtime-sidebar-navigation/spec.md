# runtime-sidebar-navigation Specification

## Purpose
TBD - created by archiving change complete-prd-gap-backlog. Update Purpose after archive.
## Requirements
### Requirement: Sidebar case metadata
The runtime sidebar SHALL receive enough metadata for each discovered case to display, group, and search by the authored case fields and by the discovered source path when available.

#### Scenario: Case path metadata is available
- **WHEN** a case is discovered from `src/components/ProductCard.case.ts`
- **THEN** the runtime sidebar SHALL be able to access the relative source path `src/components/ProductCard.case.ts` for that case

#### Scenario: Sidebar works without path metadata
- **WHEN** a case does not have discovered source path metadata
- **THEN** the sidebar SHALL still render the case using its `title` or `id`
- **AND** the workbench SHALL remain usable

### Requirement: Sidebar grouping
The sidebar SHALL group cases by explicit `case.group` when provided and SHALL derive a deterministic fallback group from source path metadata when no group is provided.

#### Scenario: Explicit group is used
- **WHEN** a case defines `group: "Inventory"`
- **THEN** the sidebar SHALL render the case under the `Inventory` group

#### Scenario: Source path fallback group is used
- **WHEN** a case has no explicit group and its discovered source path is `src/components/product-card/ProductCard.case.ts`
- **THEN** the sidebar SHALL render the case under a fallback group derived from the source folder path

#### Scenario: Generic fallback group is used
- **WHEN** a case has no explicit group and no usable source path metadata
- **THEN** the sidebar SHALL render the case under a generic fallback group

### Requirement: Sidebar search
The sidebar SHALL provide a case-insensitive search control that filters visible cases by title, id, group, fallback group, and source path.

#### Scenario: Search by title
- **WHEN** the sidebar search query matches a case title
- **THEN** the sidebar SHALL show that matching case
- **AND** it SHALL hide non-matching cases

#### Scenario: Search by id
- **WHEN** the sidebar search query matches a case id
- **THEN** the sidebar SHALL show that matching case

#### Scenario: Search by path
- **WHEN** the sidebar search query matches a case source path
- **THEN** the sidebar SHALL show that matching case

#### Scenario: Empty search shows all cases
- **WHEN** the sidebar search query is empty
- **THEN** the sidebar SHALL show all discovered cases

#### Scenario: No search results
- **WHEN** the sidebar search query matches no cases
- **THEN** the sidebar SHALL show an empty results state without changing the selected case

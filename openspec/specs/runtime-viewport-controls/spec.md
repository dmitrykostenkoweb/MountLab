# runtime-viewport-controls Specification

## Purpose
TBD - created by archiving change complete-prd-gap-backlog. Update Purpose after archive.
## Requirements
### Requirement: Viewport presets are selectable
The runtime workbench SHALL expose configured viewport presets from `MountLabConfig.viewports` as a topbar control.

#### Scenario: Configured viewport appears in topbar
- **WHEN** `mountlab.config.ts` defines a viewport preset named `mobile`
- **THEN** the topbar SHALL allow the user to select `mobile`

#### Scenario: Null viewport represents auto
- **WHEN** a viewport preset is configured with a `null` value
- **THEN** selecting that preset SHALL render the preview in unconstrained auto mode

#### Scenario: No viewports configured
- **WHEN** no viewport presets are configured
- **THEN** the workbench SHALL still provide an unconstrained preview mode

### Requirement: Viewport selection changes preview size
The preview area SHALL render the selected component inside a preview surface constrained by the selected viewport dimensions when the selected viewport has width and height values.

#### Scenario: Fixed viewport constrains preview surface
- **WHEN** the user selects a viewport preset with `width: 390` and `height: 844`
- **THEN** the preview surface SHALL be constrained to 390 by 844 CSS pixels

#### Scenario: Auto viewport is unconstrained
- **WHEN** the user selects the auto viewport
- **THEN** the preview SHALL use the available preview area without fixed width or height constraints

#### Scenario: Preview remains scrollable
- **WHEN** a fixed viewport is larger than the visible preview area
- **THEN** the workbench SHALL allow scrolling to inspect the full preview surface

### Requirement: Viewport selection is runtime state
The runtime state model SHALL track the selected viewport key, resolve invalid selections to a valid fallback, and expose the resolved viewport to preview rendering.

#### Scenario: Valid viewport selection is tracked
- **WHEN** the user selects a configured viewport preset
- **THEN** runtime state SHALL expose that preset as the active viewport

#### Scenario: Invalid viewport selection falls back
- **WHEN** runtime state receives a viewport key that is not configured
- **THEN** runtime state SHALL fall back to a valid auto/unconstrained viewport
- **AND** the workbench SHALL remain usable

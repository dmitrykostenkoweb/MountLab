## ADDED Requirements

### Requirement: Custom viewport dimensions are editable
The runtime workbench SHALL allow users to set a custom fixed preview viewport width and height without changing `MountLabConfig.viewports`.

#### Scenario: Width and height inputs update the preview
- **WHEN** the user enters valid custom width and height values
- **THEN** the preview surface SHALL be constrained to those dimensions in CSS pixels
- **AND** the selected viewport key SHALL become `custom`

#### Scenario: Editing a preset dimension creates custom viewport
- **WHEN** a configured fixed viewport preset is selected
- **AND** the user edits either the width or height input
- **THEN** the runtime SHALL preserve the other effective dimension
- **AND** the selected viewport key SHALL become `custom`

#### Scenario: Invalid custom dimensions do not break preview
- **WHEN** the user enters a missing, non-numeric, zero, or negative custom dimension
- **THEN** the workbench SHALL keep the last valid viewport dimensions or fall back to auto mode
- **AND** the workbench SHALL remain usable

### Requirement: Custom viewport can be resized by dragging
The preview area SHALL expose drag handles for interactively resizing a fixed preview viewport.

#### Scenario: Right edge drag changes width
- **WHEN** the user drags the preview surface right resize handle
- **THEN** the runtime SHALL update the custom viewport width
- **AND** the selected viewport key SHALL become `custom`

#### Scenario: Bottom edge drag changes height
- **WHEN** the user drags the preview surface bottom resize handle
- **THEN** the runtime SHALL update the custom viewport height
- **AND** the selected viewport key SHALL become `custom`

#### Scenario: Corner drag changes width and height
- **WHEN** the user drags the preview surface bottom-right resize handle
- **THEN** the runtime SHALL update both custom viewport width and custom viewport height
- **AND** the selected viewport key SHALL become `custom`

#### Scenario: Dragged dimensions are constrained
- **WHEN** dragging would create dimensions outside the supported custom viewport range
- **THEN** the runtime SHALL clamp the custom viewport dimensions to the supported range

### Requirement: Custom viewport state is synchronized with URL
The runtime state model SHALL persist and restore custom viewport selection and dimensions through URL state.

#### Scenario: Custom viewport restores from URL
- **WHEN** the workbench loads with `viewport=custom` and valid custom width and height URL params
- **THEN** runtime state SHALL select the custom viewport
- **AND** the preview surface SHALL use the restored custom dimensions

#### Scenario: Custom viewport writes to URL
- **WHEN** the user sets custom viewport dimensions through inputs or dragging
- **THEN** the URL SHALL include the custom viewport key and custom width and height values

#### Scenario: Preset viewport clears custom URL selection
- **WHEN** the user selects a configured viewport preset or auto mode after using custom dimensions
- **THEN** the URL SHALL represent the selected preset or auto mode
- **AND** custom viewport URL params SHALL NOT control the active preview size

#### Scenario: Invalid custom URL falls back
- **WHEN** the workbench loads with `viewport=custom` and invalid or missing custom dimensions
- **THEN** runtime state SHALL fall back to a valid auto/unconstrained viewport
- **AND** the workbench SHALL remain usable

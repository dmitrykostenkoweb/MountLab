# runtime-right-panel Specification

## Purpose
Runtime right panel UI for editing props JSON, showing validation feedback, observing configured component events, displaying notes, and supporting the three-column workbench layout.

## Requirements
### Requirement: Three-column runtime layout
The runtime workbench SHALL render a right panel alongside the existing sidebar and preview workspace.

#### Scenario: Workbench renders right panel
- **WHEN** the runtime workbench is opened
- **THEN** it SHALL render a left sidebar, a center preview workspace, and a right panel
- **AND** the right panel SHALL be visible without replacing the sidebar, topbar, or preview

#### Scenario: Preview remains usable with right panel
- **WHEN** a case and variant are selected
- **THEN** the preview SHALL render the selected component in the center workspace
- **AND** the right panel SHALL not prevent preview scrolling or render-error display

### Requirement: Props JSON editor
The right panel SHALL display the current props as editable formatted JSON and SHALL provide reset and copy actions for that JSON.

#### Scenario: Selected variant props are shown as JSON
- **WHEN** a case and variant with props are selected
- **THEN** the right panel SHALL show the current props as JSON
- **AND** the JSON SHALL be derived from the runtime current props state

#### Scenario: Valid JSON updates preview props
- **WHEN** the user edits the props JSON to a valid object that passes validation
- **THEN** the runtime SHALL update current props with the parsed object
- **AND** the preview SHALL render the selected component using the updated current props

#### Scenario: Invalid JSON does not crash preview
- **WHEN** the user enters invalid JSON in the props editor
- **THEN** the right panel SHALL show a readable JSON parse error
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

#### Scenario: Props reset restores selected variant props
- **WHEN** the user resets props from the right panel
- **THEN** the runtime SHALL replace current props with a fresh copy of the selected variant props
- **AND** the right panel SHALL show the restored props JSON

#### Scenario: Props JSON can be copied
- **WHEN** the user copies props from the right panel
- **THEN** the runtime SHALL request writing the current props editor text to the clipboard
- **AND** the runtime SHALL NOT change current props, selected case, selected variant, selected wrapper, or preview state

### Requirement: Props validation feedback
The right panel SHALL show validation feedback for edited props.

#### Scenario: No schema reports validation as unavailable
- **WHEN** the selected case has no props schema
- **THEN** the right panel SHALL indicate that schema validation is not configured
- **AND** valid JSON object edits SHALL still update current props

#### Scenario: Valid props pass schema validation
- **WHEN** the selected case has a compatible props schema
- **AND** the user enters props JSON that passes that schema
- **THEN** the right panel SHALL show a valid validation result
- **AND** the runtime SHALL update current props with the validated object

#### Scenario: Invalid props show schema errors
- **WHEN** the selected case has a compatible props schema
- **AND** the user enters props JSON that fails that schema
- **THEN** the right panel SHALL show readable validation errors
- **AND** the runtime SHALL keep the preview on the last valid current props

### Requirement: Event log display
The right panel SHALL display events emitted by the selected component when those event names are configured on the selected case.

#### Scenario: Configured event is logged
- **WHEN** the selected component emits an event listed in the selected case `events`
- **THEN** the right panel SHALL add an event log entry with the event name
- **AND** the entry SHALL include a timestamp
- **AND** the entry SHALL include the emitted payload when a payload is available

#### Scenario: Event log can be cleared
- **WHEN** the right panel contains event log entries
- **AND** the user clears the event log
- **THEN** the right panel SHALL remove the existing event log entries

#### Scenario: Event log resets on case or variant change
- **WHEN** the user selects a different case or variant
- **THEN** the runtime SHALL clear event log entries from the previous selection

### Requirement: Notes display
The right panel SHALL display notes for the selected case and selected variant when notes are provided.

#### Scenario: Case notes are shown
- **WHEN** the selected case defines notes
- **THEN** the right panel SHALL display the selected case notes

#### Scenario: Variant notes are shown
- **WHEN** the selected variant defines notes
- **THEN** the right panel SHALL display the selected variant notes

#### Scenario: Empty notes state is handled
- **WHEN** neither the selected case nor the selected variant defines notes
- **THEN** the right panel SHALL render the notes section without showing stale notes from a previous selection

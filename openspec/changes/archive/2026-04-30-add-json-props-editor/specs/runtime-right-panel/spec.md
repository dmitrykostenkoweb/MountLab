## MODIFIED Requirements

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

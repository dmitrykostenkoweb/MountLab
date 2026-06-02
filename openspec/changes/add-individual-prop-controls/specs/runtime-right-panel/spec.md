## MODIFIED Requirements

### Requirement: Props field editor
The right panel SHALL display each top-level current prop as an individual editable control and SHALL provide reset and copy actions for the complete props object.

#### Scenario: Selected variant props are shown as individual fields
- **WHEN** a case and variant with props are selected
- **THEN** the right panel SHALL show one editable field for each top-level current prop
- **AND** the fields SHALL be derived from the runtime current props state

#### Scenario: Empty variant props can seed from component runtime props
- **WHEN** a selected variant has no authored props
- **AND** the selected component exposes Vue runtime prop options
- **THEN** the runtime SHALL initialize current props from those component prop options
- **AND** the right panel SHALL show individual fields for the initialized current props

#### Scenario: String prop uses text input
- **WHEN** a current prop value is a string
- **THEN** the right panel SHALL render a text input for that prop
- **AND** editing the input to a value that passes validation SHALL update current props
- **AND** the preview SHALL render using the updated current props

#### Scenario: Number prop uses number input
- **WHEN** a current prop value is a number
- **THEN** the right panel SHALL render a number input for that prop
- **AND** editing the input to a finite number that passes validation SHALL update current props
- **AND** the preview SHALL render using the updated current props

#### Scenario: Boolean prop uses switch
- **WHEN** a current prop value is a boolean
- **THEN** the right panel SHALL render an on/off switch for that prop
- **AND** toggling the switch to a value that passes validation SHALL update current props
- **AND** the preview SHALL render using the updated current props

#### Scenario: Object and array props use field JSON textareas
- **WHEN** a current prop value is an object, array, or null
- **THEN** the right panel SHALL render a JSON textarea for that prop
- **AND** editing the textarea to valid JSON that passes validation SHALL update that prop inside current props
- **AND** the preview SHALL render using the updated current props

#### Scenario: Invalid field JSON does not crash preview
- **WHEN** the user enters invalid JSON in an object, array, or null prop textarea
- **THEN** the right panel SHALL show a readable field-local parse error
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

#### Scenario: Invalid primitive edit does not crash preview
- **WHEN** the user enters a primitive field value that cannot be converted to the prop's expected primitive kind
- **THEN** the right panel SHALL show a readable field-local error
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

#### Scenario: Props reset restores selected variant props
- **WHEN** the user resets props from the right panel
- **THEN** the runtime SHALL replace current props with a fresh copy of the selected variant props
- **AND** the right panel SHALL show fields for the restored current props
- **AND** stale field-local errors SHALL be cleared

#### Scenario: Props can be copied as JSON
- **WHEN** the user copies props from the right panel
- **THEN** the runtime SHALL request writing the complete current props object as formatted JSON to the clipboard
- **AND** the runtime SHALL NOT change current props, selected case, selected variant, selected wrapper, or preview state

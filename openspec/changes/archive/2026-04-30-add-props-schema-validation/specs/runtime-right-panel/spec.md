## MODIFIED Requirements

### Requirement: Props validation feedback
The right panel SHALL show validation feedback for edited props.

#### Scenario: No schema reports validation as unavailable
- **WHEN** the selected case has no props schema
- **THEN** the right panel SHALL indicate that schema validation is not configured
- **AND** valid JSON object edits SHALL still update current props

#### Scenario: Incompatible schema reports validation as unavailable
- **WHEN** the selected case has a props schema that does not expose a callable `safeParse`
- **THEN** the right panel SHALL indicate that schema validation is not configured
- **AND** valid JSON object edits SHALL still update current props

#### Scenario: Valid props pass schema validation
- **WHEN** the selected case has a compatible props schema
- **AND** the user enters props JSON that passes that schema
- **THEN** the right panel SHALL show a valid validation result
- **AND** the runtime SHALL update current props with the validated object
- **AND** the preview SHALL render using the validated object

#### Scenario: Invalid props show schema errors
- **WHEN** the selected case has a compatible props schema
- **AND** the user enters props JSON that fails that schema
- **THEN** the right panel SHALL show readable validation errors
- **AND** each schema issue SHALL include a message
- **AND** each schema issue SHALL include its path when available
- **AND** each schema issue SHALL include expected and received values when available
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

#### Scenario: Schema validation throws
- **WHEN** the selected case has a compatible props schema
- **AND** validating props throws an error
- **THEN** the right panel SHALL show a readable validation error
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

#### Scenario: Validated result must be object props
- **WHEN** the selected case has a compatible props schema
- **AND** validation succeeds with non-object validated data
- **THEN** the right panel SHALL show a readable validation error
- **AND** the runtime SHALL keep the preview on the last valid current props
- **AND** the workbench SHALL remain usable

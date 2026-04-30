## ADDED Requirements

### Requirement: Runtime state model
The runtime workbench SHALL maintain a single authoritative state model for selected case ID, selected variant ID, selected wrapper key, and current props.

#### Scenario: Initial state with discovered cases
- **WHEN** the runtime starts with one or more discovered component cases
- **THEN** the state model SHALL select a valid case
- **AND** it SHALL select a valid variant belonging to that case
- **AND** it SHALL expose current props derived from the selected variant props

#### Scenario: Initial state with no discovered cases
- **WHEN** the runtime starts with no discovered component cases
- **THEN** the selected case SHALL be null
- **AND** the selected variant SHALL be null
- **AND** current props SHALL be an empty object

### Requirement: URL selection restoration
The runtime workbench SHALL restore initial case, variant, and wrapper selection from URL query params named `case`, `variant`, and `wrapper`.

#### Scenario: Valid URL params are restored
- **WHEN** the runtime starts with URL params that reference an existing case, an existing variant for that case, and an existing wrapper key
- **THEN** the state model SHALL select that case
- **AND** it SHALL select that variant
- **AND** it SHALL select that wrapper

#### Scenario: Invalid case URL param falls back
- **WHEN** the runtime starts with a `case` URL param that does not match a discovered case
- **THEN** the state model SHALL select the first discovered case
- **AND** it SHALL select a valid variant for the fallback case

#### Scenario: Invalid variant URL param falls back
- **WHEN** the runtime starts with a valid `case` URL param and a `variant` URL param that does not belong to the selected case
- **THEN** the state model SHALL select the first variant for the selected case

#### Scenario: Invalid wrapper URL param falls back
- **WHEN** the runtime starts with a `wrapper` URL param that does not exist in configured wrappers
- **THEN** the state model SHALL select a valid fallback wrapper when one is available
- **AND** it SHALL not expose the invalid wrapper key as the active wrapper

### Requirement: Wrapper fallback resolution
The runtime workbench SHALL resolve the active wrapper from the selected wrapper key, selected case wrapper, configured default wrapper, or built-in empty wrapper fallback.

#### Scenario: Case wrapper is used when no explicit wrapper is selected
- **WHEN** a selected case declares a wrapper key that exists in configured wrappers
- **AND** no explicit wrapper key has been selected
- **THEN** the active wrapper SHALL be the case wrapper

#### Scenario: Default wrapper is used when case wrapper is missing
- **WHEN** the selected case has no valid wrapper key
- **AND** the configured default wrapper exists
- **THEN** the active wrapper SHALL be the default wrapper

#### Scenario: Built-in empty wrapper is used when no configured wrapper is valid
- **WHEN** no explicit wrapper, case wrapper, or default wrapper resolves to a configured wrapper component
- **THEN** the preview SHALL render using a built-in empty wrapper fallback

### Requirement: Props reset on selection changes
The runtime workbench SHALL reset current props from the selected variant whenever the selected case or selected variant changes.

#### Scenario: Case change resets current props
- **WHEN** the user selects a different case
- **THEN** current props SHALL be replaced with a fresh copy of that case's active variant props

#### Scenario: Variant change resets current props
- **WHEN** the user selects a different variant for the current case
- **THEN** current props SHALL be replaced with a fresh copy of the selected variant props

#### Scenario: Variant props are not mutated
- **WHEN** current props are later edited by runtime UI features
- **THEN** the original selected variant props SHALL remain unchanged

### Requirement: Preview uses current props
The runtime preview SHALL render the selected component using current props from the runtime state model.

#### Scenario: Preview receives current props
- **WHEN** a component case and variant are selected
- **THEN** the preview SHALL bind the state model's current props to the selected component
- **AND** it SHALL not bind directly to the selected variant props object

### Requirement: URL synchronization
The runtime workbench SHALL keep URL query params synchronized with the active case, variant, and wrapper selection.

#### Scenario: Selecting a case updates URL
- **WHEN** the user selects a different case
- **THEN** the URL query param `case` SHALL reflect the active case ID
- **AND** the URL query param `variant` SHALL reflect the active variant ID for that case

#### Scenario: Selecting a variant updates URL
- **WHEN** the user selects a different variant
- **THEN** the URL query param `variant` SHALL reflect the active variant ID

#### Scenario: Selecting a wrapper updates URL
- **WHEN** the user selects a different wrapper
- **THEN** the URL query param `wrapper` SHALL reflect the active wrapper key

#### Scenario: URL sync preserves unrelated params
- **WHEN** runtime selection changes while the current URL contains unrelated query params
- **THEN** the unrelated query params SHALL remain in the URL

#### Scenario: URL sync avoids browser history noise
- **WHEN** runtime selection changes
- **THEN** the runtime SHALL update the current URL without adding a new browser history entry for each selection change

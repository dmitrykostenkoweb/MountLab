## ADDED Requirements

### Requirement: Events tab explains missing event configuration
The right panel SHALL clearly indicate when the selected case has no configured or inferred event names.

#### Scenario: Selected case has no event names
- **WHEN** a selected case has no `events` entries
- **THEN** the Events tab SHALL show a no-events message
- **AND** the message SHALL distinguish missing event configuration from an empty recorded event log

#### Scenario: Configured event names still show empty log state
- **WHEN** a selected case has one or more `events` entries
- **AND** no configured events have been emitted yet
- **THEN** the Events tab SHALL show the configured event names
- **AND** it SHALL show that no events have been recorded yet

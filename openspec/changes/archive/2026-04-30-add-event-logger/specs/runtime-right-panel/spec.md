## MODIFIED Requirements

### Requirement: Event log display
The right panel SHALL display events emitted by the selected component when those event names are configured on the selected case.

#### Scenario: Configured event is logged
- **WHEN** the selected component emits an event listed in the selected case `events`
- **THEN** the runtime SHALL add an event log entry with the event name
- **AND** the entry SHALL include a timestamp
- **AND** the entry SHALL include the emitted payload when a payload is available
- **AND** the right panel SHALL display the event log entry

#### Scenario: Event handlers are derived from selected case events
- **WHEN** a case with configured `events` is selected
- **THEN** the preview SHALL build event handlers for those configured event names
- **AND** emitted configured events SHALL be forwarded to runtime state for logging

#### Scenario: Event log can be cleared
- **WHEN** the right panel contains event log entries
- **AND** the user clears the event log
- **THEN** the right panel SHALL remove the existing event log entries

#### Scenario: Event log resets on case change
- **WHEN** the user selects a different case
- **THEN** the runtime SHALL clear event log entries from the previous case

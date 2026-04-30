## MODIFIED Requirements

### Requirement: Wrapper resolution
The runtime workbench SHALL resolve the active wrapper from the selected wrapper key, selected case wrapper, configured default wrapper, or built-in empty wrapper fallback, and SHALL expose non-blocking UI warning state when a requested wrapper key cannot be resolved.

#### Scenario: Case wrapper is used when no explicit wrapper is selected
- **WHEN** a selected case declares a wrapper key that exists in configured wrappers
- **AND** no explicit wrapper key has been selected
- **THEN** the active wrapper SHALL be the case wrapper
- **AND** the runtime SHALL NOT show a wrapper fallback warning

#### Scenario: Default wrapper is used when case wrapper is missing
- **WHEN** the selected case declares a wrapper key that does not exist in configured wrappers
- **AND** the configured default wrapper exists in configured wrappers
- **THEN** the active wrapper SHALL be the default wrapper
- **AND** the preview SHALL render using the default wrapper
- **AND** the runtime UI SHALL show a non-blocking warning naming the missing case wrapper key

#### Scenario: Built-in empty wrapper is used when default wrapper is missing
- **WHEN** the selected case declares a wrapper key that does not exist in configured wrappers
- **AND** the configured default wrapper also does not exist in configured wrappers
- **THEN** the preview SHALL render using a built-in empty wrapper fallback
- **AND** the runtime UI SHALL show a non-blocking warning naming the missing wrapper key or keys

#### Scenario: Built-in empty wrapper is used when no configured wrapper is valid
- **WHEN** no explicit wrapper, case wrapper, or default wrapper resolves to a configured wrapper component
- **THEN** the preview SHALL render using a built-in empty wrapper fallback
- **AND** the runtime workbench SHALL remain usable

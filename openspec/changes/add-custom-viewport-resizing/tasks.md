## 1. Runtime State

- [x] 1.1 Extend URL selection parsing and writing to include `viewportWidth` and `viewportHeight` for custom viewport state.
- [x] 1.2 Add custom viewport state, dimension normalization, clamping, and fallback handling to `useWorkbenchState`.
- [x] 1.3 Update viewport option resolution so `custom` is a runtime option while existing `auto` and configured presets keep their behavior.
- [x] 1.4 Add state actions for selecting a preset viewport and setting custom viewport dimensions from inputs or resize events.

## 2. Topbar Controls

- [x] 2.1 Pass effective viewport dimensions and custom dimension update handlers from `WorkbenchApp.vue` to `TopBar.vue`.
- [x] 2.2 Add compact width and height numeric inputs beside the viewport selector.
- [x] 2.3 Ensure editing either input switches the active viewport to `custom` while preserving the other effective dimension.
- [x] 2.4 Keep the topbar layout usable with existing variant, wrapper, viewport, warning, and copy URL controls.

## 3. Preview Resize Interaction

- [x] 3.1 Pass the effective viewport and resize handler from `WorkbenchApp.vue` to `PreviewArea.vue`.
- [x] 3.2 Add right edge, bottom edge, and bottom-right corner resize handles for fixed/custom preview surfaces.
- [x] 3.3 Implement pointer drag math with pointer capture and emit normalized next dimensions upward.
- [x] 3.4 Ensure auto mode remains unconstrained and does not show fixed-size resize affordances.

## 4. Tests

- [x] 4.1 Add runtime state tests for restoring valid custom dimensions from URL and falling back from invalid custom URL params.
- [x] 4.2 Add runtime state tests for input-style custom dimension updates, including preset-to-custom behavior and clamping.
- [x] 4.3 Add component tests or focused interaction coverage for preview resize events from right, bottom, and corner handles.
- [x] 4.4 Update existing viewport tests as needed to prove preset and auto behavior are unchanged.

## 5. Verification

- [x] 5.1 Run the relevant unit test suite.
- [x] 5.2 Run typecheck/build verification required by the project.
- [x] 5.3 Manually inspect the playground workbench to confirm inputs, drag handles, URL sync, preset selection, and auto mode behavior.

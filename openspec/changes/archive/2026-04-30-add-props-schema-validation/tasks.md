## 1. Validation Adapter

- [x] 1.1 Audit `useWorkbenchState` schema detection to ensure only schemas exposing callable `safeParse(value)` are treated as compatible.
- [x] 1.2 Ensure missing or incompatible `propsSchema` reports validation unavailable and does not block valid JSON object edits.
- [x] 1.3 Ensure `safeParse` success updates `currentProps` only with validated object data and rejects non-object validated output with a readable error.
- [x] 1.4 Ensure `safeParse` failure and thrown validation errors return invalid validation state without replacing the last valid `currentProps`.

## 2. Error Normalization and UI Feedback

- [x] 2.1 Normalize schema issues into readable rows with `path` and `message`.
- [x] 2.2 Include `expected` and `received` metadata in normalized issues when provided by the schema error.
- [x] 2.3 Render validation message and issue rows in the right panel without throwing when issue fields are missing or unexpected.

## 3. Preview Safety

- [x] 3.1 Verify invalid JSON, non-object JSON, schema validation failures, and thrown schema errors keep preview bound to the last valid props.
- [x] 3.2 Verify valid edited props still re-render the preview after passing JSON parsing and optional schema validation.

## 4. Verification

- [x] 4.1 Add or update focused automated coverage if the current test setup supports runtime composable tests.
- [x] 4.2 Run `npm run typecheck`.
- [x] 4.3 Run `openspec status --change add-props-schema-validation`.

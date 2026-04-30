## 1. Deterministic Case Discovery

- [x] 1.1 Sort resolved case paths before generating the cases virtual module.
- [x] 1.2 Use project-relative case paths in generated diagnostics when possible.

## 2. Generated Case Registry Validation

- [x] 2.1 Generate validation code in `virtual:mountlab/cases` for object-like default exports.
- [x] 2.2 Validate each case has a non-empty string `id`, a present `component`, and a `variants` array.
- [x] 2.3 Detect duplicate case IDs and report every involved case path.
- [x] 2.4 Export only validated case objects when all discovered cases pass validation.

## 3. Verification

- [x] 3.1 Run `npm run typecheck` and confirm it exits successfully.
- [x] 3.2 Run `npm run build` and confirm it exits successfully.
- [x] 3.3 Review generated error messages for invalid and duplicate case scenarios.

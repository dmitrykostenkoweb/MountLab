## 1. CLI flag wiring

- [x] 1.1 Add `--group <name>`, `--wrapper <key>`, `--dry-run`, `--force` options to the `add` command in `src/cli/index.ts`
- [x] 1.2 Update `runAdd` signature to accept `(componentPath: string, options: AddOptions)` and define the `AddOptions` interface

## 2. Input validation

- [x] 2.1 Resolve the component path against `process.cwd()` (handles both relative and absolute inputs)
- [x] 2.2 Check file exists with `fs.existsSync`; exit with non-zero code and readable error if missing
- [x] 2.3 Check file extension is `.vue`; exit with non-zero code and readable error if not

## 3. Name inference

- [x] 3.1 Implement `inferComponentName(filePath: string): { id: string; title: string; stem: string }` — if filename is `index.vue` use parent directory name as the base stem, otherwise use the filename stem
- [x] 3.2 Implement PascalCase/camelCase → kebab-case conversion (split on case boundaries and consecutive uppercase runs, lowercase, join with `-`)
- [x] 3.3 Derive `title` from kebab tokens (capitalize each token, join with space)

## 4. Output path resolution

- [x] 4.1 For standard files: output path = `<component-dir>/<ComponentStem>.case.ts`
- [x] 4.2 For `index.vue`: output path = `<component-dir>/<InferredTitle>.case.ts` (e.g. `ProductCard.case.ts`, not `index.case.ts`)

## 5. Guard against overwriting

- [x] 5.1 Check if output `.case.ts` already exists; if yes and `--force` is not set, exit with non-zero code and print the existing file path
- [x] 5.2 Track whether file existed before write (for "Created" vs "Overwrote" message)

## 6. Case file template

- [x] 6.1 Compute the relative import path from the case file to the `.vue` component (always `./filename.vue`)
- [x] 6.2 Write the `.case.ts` template string using inferred `id`, `title`, `group`, `wrapper`, and computed import path
- [x] 6.3 Ensure the generated file is valid TypeScript (correct import syntax, `export default defineComponentCase({...})`)

## 7. Dry-run support

- [x] 7.1 When `--dry-run` is set, skip all `fs.writeFileSync` calls
- [x] 7.2 Print `[dry-run] Would create: <path>` or `[dry-run] Would overwrite: <path>` depending on file existence

## 8. Output messages

- [x] 8.1 Print the inferred `id` and `title` as part of command output so the developer can verify them
- [x] 8.2 Print `✓ Created <path>` on successful new file write
- [x] 8.3 Print `✓ Overwrote <path>` when `--force` overwrites an existing file
- [x] 8.4 Print a completion hint (e.g. "Edit the generated file to add variants, then run `mountlab dev`")

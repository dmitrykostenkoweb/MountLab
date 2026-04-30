# cli-add Specification

## Purpose
The `mountlab add <component-path>` CLI command that scaffolds a `.case.ts` file co-located with a Vue component. Removes boilerplate friction by generating a correctly-structured, import-ready case file so the developer can immediately define variants.

## ADDED Requirements

### Requirement: Input validation — file existence
The command SHALL validate that the provided component file exists on disk before generating any output.

#### Scenario: File does not exist
- **WHEN** `mountlab add src/components/Missing.vue` is run and the file does not exist
- **THEN** the command SHALL exit with a non-zero code and print a readable error indicating the file was not found

#### Scenario: File exists
- **WHEN** the provided path resolves to an existing file
- **THEN** the command SHALL proceed to extension validation

---

### Requirement: Input validation — Vue file extension
The command SHALL accept only files with a `.vue` extension.

#### Scenario: Non-Vue file rejected
- **WHEN** `mountlab add src/components/MyComp.ts` is run
- **THEN** the command SHALL exit with a non-zero code and print an error stating that only `.vue` files are supported

#### Scenario: Vue file accepted
- **WHEN** the provided path ends with `.vue` and the file exists
- **THEN** the command SHALL proceed to name inference

---

### Requirement: Component name inference
The command SHALL derive a stable `id` (kebab-case) and `title` (human-readable) from the component file path.

#### Scenario: PascalCase component name
- **WHEN** the component file is `ProductCard.vue`
- **THEN** the inferred `id` SHALL be `"product-card"` and `title` SHALL be `"Product Card"`

#### Scenario: Mixed uppercase acronym
- **WHEN** the component file is `UIButton.vue`
- **THEN** the inferred `id` SHALL be `"ui-button"` and `title` SHALL be `"UI Button"`

#### Scenario: Already kebab-case filename
- **WHEN** the component file is `my-component.vue`
- **THEN** the inferred `id` SHALL be `"my-component"` and `title` SHALL be `"My Component"`

#### Scenario: index.vue uses parent folder name
- **WHEN** the component file is `src/product-card/index.vue`
- **THEN** the inferred `id` SHALL be `"product-card"` and `title` SHALL be `"Product Card"` (derived from the parent directory name, not the filename)

---

### Requirement: Generated case file path
The command SHALL generate a `.case.ts` file co-located with the component.

#### Scenario: Standard component file
- **WHEN** the component is at `src/components/ProductCard.vue`
- **THEN** the output SHALL be written to `src/components/ProductCard.case.ts`

#### Scenario: index.vue component
- **WHEN** the component is at `src/product-card/index.vue`
- **THEN** the output SHALL be written to `src/product-card/ProductCard.case.ts` (named after the inferred title, not `index.case.ts`)

---

### Requirement: Generated case file content
The generated `.case.ts` SHALL be a valid TypeScript file with a `defineComponentCase` call.

#### Scenario: File contains correct import of defineComponentCase
- **WHEN** the file is generated
- **THEN** it SHALL import `defineComponentCase` from `'@mountlab/vue'`

#### Scenario: File contains correct component import
- **WHEN** the file is generated for `src/components/ProductCard.vue`
- **THEN** it SHALL import `ProductCard` from `'./ProductCard.vue'` using a relative path

#### Scenario: File contains inferred id and title
- **WHEN** the file is generated
- **THEN** the `id` field SHALL equal the inferred kebab-case id and `title` SHALL equal the inferred human-readable title

#### Scenario: File contains a default variant scaffold
- **WHEN** the file is generated
- **THEN** the `variants` array SHALL contain one entry with `id: 'default'`, `title: 'Default'`, and a `props: {}` placeholder with a TODO comment

#### Scenario: File contains commented-out events
- **WHEN** the file is generated
- **THEN** the `events` array SHALL be present and contain commented-out example entries

#### Scenario: group defaults to Components
- **WHEN** no `--group` flag is provided
- **THEN** the generated `group` field SHALL equal `'Components'`

#### Scenario: wrapper defaults to default
- **WHEN** no `--wrapper` flag is provided
- **THEN** the generated `wrapper` field SHALL equal `'default'`

---

### Requirement: --group flag
The command SHALL accept a `--group <name>` flag to set the sidebar group in the generated file.

#### Scenario: Custom group applied
- **WHEN** `mountlab add src/components/ProductCard.vue --group Inventory` is run
- **THEN** the generated `group` field SHALL equal `'Inventory'`

---

### Requirement: --wrapper flag
The command SHALL accept a `--wrapper <key>` flag to set the wrapper reference in the generated file.

#### Scenario: Custom wrapper applied
- **WHEN** `mountlab add src/components/ProductCard.vue --wrapper modal` is run
- **THEN** the generated `wrapper` field SHALL equal `'modal'`

---

### Requirement: Guard against overwriting existing case file
The command SHALL not overwrite an existing `.case.ts` file unless `--force` is provided.

#### Scenario: Existing case file without --force
- **WHEN** a `.case.ts` file already exists at the output path and `--force` is not set
- **THEN** the command SHALL exit with a non-zero code and print the existing file path
- **AND** it SHALL NOT overwrite the file

#### Scenario: Existing case file with --force
- **WHEN** a `.case.ts` file already exists and `--force` is provided
- **THEN** the command SHALL overwrite the file and print "Overwrote <path>"

#### Scenario: New case file success message
- **WHEN** the file did not previously exist and is written successfully
- **THEN** the command SHALL print "Created <path>"

---

### Requirement: --dry-run mode
The command SHALL support a `--dry-run` flag that previews output without writing any files.

#### Scenario: Dry run produces no file changes
- **WHEN** `mountlab add <path> --dry-run` is run
- **THEN** no files SHALL be created or modified on disk

#### Scenario: Dry run prints intended action
- **WHEN** `mountlab add <path> --dry-run` is run and the output file does not exist
- **THEN** the output SHALL include `[dry-run] Would create: <output-path>`

#### Scenario: Dry run with existing file
- **WHEN** the output `.case.ts` already exists and `--dry-run --force` is run
- **THEN** the output SHALL indicate `[dry-run] Would overwrite: <output-path>`

---

### Requirement: Printed inferred names
The command SHALL print the inferred `id` and `title` so the developer can verify them immediately.

#### Scenario: Success output includes inferred metadata
- **WHEN** the command succeeds (or dry-runs)
- **THEN** stdout SHALL include the inferred `id` and `title` values alongside the output file path

---

### Requirement: Absolute and relative input paths are both accepted
The command SHALL resolve input paths relative to `process.cwd()`.

#### Scenario: Relative path input
- **WHEN** `mountlab add src/components/ProductCard.vue` is run from the project root
- **THEN** the file SHALL be resolved as `<cwd>/src/components/ProductCard.vue`

#### Scenario: Absolute path input
- **WHEN** an absolute path is provided
- **THEN** the file SHALL be used as-is without prepending cwd

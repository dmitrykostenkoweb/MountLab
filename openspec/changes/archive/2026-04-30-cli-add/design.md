## Context

`src/cli/commands/add.ts` is currently a stub that only prints what it would do. The `init.ts` command (already implemented) establishes the implementation pattern: template strings for generated content, `FileSpec` objects, `--dry-run`/`--force` flags, and `node:fs`/`node:path` — all reusable here.

The generated `.case.ts` file is co-located with the component and must produce a stable kebab-case `id` that will later appear in the runtime URL state (`?case=product-card`). Getting this ID stable and correct on first generate matters.

## Goals / Non-Goals

**Goals:**
- Validate input file (exists, `.vue` extension)
- Infer component name from file path using a deterministic algorithm
- Generate a correct, import-ready `.case.ts` scaffold next to the component
- Support `--group`, `--wrapper`, `--dry-run`, `--force` flags
- Handle `index.vue` gracefully by falling back to parent folder name

**Non-Goals:**
- Parsing Vue SFC to extract props/emits (Phase 1 only — scaffold is intentionally minimal)
- Auto-registering the case in config or any central registry
- Generating Zod schema stubs

---

## Decisions

### 1. Name inference algorithm

From file path → `id` (kebab-case) + `title` (human-readable):

```
src/components/ProductCard.vue     → id: "product-card",   title: "Product Card"
src/components/UIButton.vue        → id: "ui-button",       title: "UI Button"
src/product-card/index.vue         → id: "product-card",   title: "Product Card"
src/components/my-component.vue    → id: "my-component",   title: "My Component"
```

**Algorithm:**
1. If filename is `index.vue` → use parent directory name as the base stem
2. Otherwise use filename stem (strip `.vue`)
3. Normalize to kebab-case:
   - Split PascalCase/camelCase runs: `ProductCard` → `Product-Card`
   - Split consecutive uppercase: `UIButton` → `UI-Button`
   - Replace existing separators (`_`, ` `) with `-`
   - Lowercase everything
4. Derive `title` from kebab tokens: `product-card` → `Product Card`

Rationale: deterministic, no regex complexity at runtime, matches URL-safe convention used by the rest of the system.

**Alternatives considered:**
- Using a library like `change-case`: avoided to keep zero new runtime deps
- Reading `name` from SFC `<script setup>` AST: too complex for MVP, fragile

---

### 2. Output file path

```
src/components/ProductCard.vue     → src/components/ProductCard.case.ts
src/product-card/index.vue         → src/product-card/ProductCard.case.ts
```

For `index.vue`, the case file is named after the inferred component title, not `index.case.ts`. This avoids ambiguous filenames in a folder containing multiple index-based components.

---

### 3. Generated file template

```ts
import { defineComponentCase } from '@mountlab/vue'
import <ComponentName> from './<filename>.vue'

export default defineComponentCase({
  id: '<inferred-id>',
  title: '<inferred-title>',
  group: '<group-or-Components>',

  component: <ComponentName>,
  wrapper: '<wrapper-or-default>',

  variants: [
    {
      id: 'default',
      title: 'Default',
      props: {
        // TODO: add props
      },
    },
  ],

  events: [
    // 'click',
    // 'submit',
  ],
})
```

- `group` defaults to `'Components'` unless `--group` is provided
- `wrapper` defaults to `'default'` unless `--wrapper` is provided
- Import path is always relative (`./<filename>.vue`)

---

### 4. Guard against overwriting

Same pattern as `init.ts`:
- If `.case.ts` already exists and `--force` is not set → exit with error, print filename
- With `--force` → overwrite and print "Overwrote"
- New file → print "Created"

---

### 5. Input validation order

1. Check file exists (`fs.existsSync`) → if not: exit with readable error
2. Check extension is `.vue` → if not: exit with readable error
3. Check output `.case.ts` doesn't already exist (unless `--force`) → if exists: exit
4. Write file (or dry-run print)

Fail fast, clear errors. No silent fallbacks.

---

## Risks / Trade-offs

- **Name inference edge cases**: Unusual component names (e.g., `V2Form.vue`, `MyHTTPClient.vue`) may produce unexpected kebab output. Risk is low for MVP; the developer can always edit the generated file. Mitigation: print the inferred id/title so developer sees it immediately.
- **index.vue in root src/**: `src/index.vue` would infer `id: "src"` — unlikely but possible. Mitigation: use `path.basename(dir)` not full path.
- **Absolute vs relative path input**: developer may pass an absolute path. `path.resolve(cwd, componentPath)` handles both. Import path in template is always computed relative to the case file's own directory.

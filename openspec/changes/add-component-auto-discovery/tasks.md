## 1. Core Config Contract

- [x] 1.1 Add `components?: string[]` to `MountLabConfig`.
- [x] 1.2 Update config helper documentation and examples to describe component discovery separately from authored case discovery.

## 2. Vite Plugin Discovery

- [x] 2.1 Add component glob resolution for configured `.vue` files with deterministic sorting.
- [x] 2.2 Implement sidecar matching so `ProductCard.vue` is covered by `ProductCard.case.ts` and `product-card/index.vue` is covered by `ProductCard.case.ts`.
- [x] 2.3 Generate synthetic `ComponentCase` objects for uncovered components with stable ID, title, fallback group, component import, and default variant.
- [x] 2.4 Merge authored and synthetic entries before duplicate ID validation.
- [x] 2.5 Preserve existing authored case validation and path metadata behavior.
- [x] 2.6 Watch configured component globs and refresh the registry when `.vue` files are added or removed.

## 3. Playground

- [x] 3.1 Configure the playground to discover Vue components directly.
- [x] 3.2 Remove the required `examples/playground/src/components/ProductCard.case.ts` file.
- [x] 3.3 Smoke-check that ProductCard still appears in the MountLab sidebar and preview.

## 4. Tests

- [x] 4.1 Add plugin tests for synthetic case module generation from discovered `.vue` files.
- [x] 4.2 Add plugin tests proving authored sidecar cases suppress synthetic cases.
- [x] 4.3 Add plugin tests for deterministic merged ordering and duplicate ID diagnostics.
- [x] 4.4 Add type tests or compile coverage for the new `MountLabConfig.components` field.

## 5. Verification

- [x] 5.1 Run the relevant unit tests.
- [x] 5.2 Run typecheck/build verification required by the project.
- [x] 5.3 Run the playground workbench and manually confirm the no-case-file flow.

## 1. TypeScript Vue SFC Support

- [x] 1.1 Add a project-level TypeScript declaration for `*.vue` imports.
- [x] 1.2 Confirm the declaration is included by the existing TypeScript configuration.

## 2. Runtime Source Cleanup

- [x] 2.1 Remove unused imports from runtime source files touched by the type-check failure area.
- [x] 2.2 Confirm runtime source cleanup does not change selected case, variant, wrapper, or preview behavior.

## 3. Verification

- [x] 3.1 Run `npm run typecheck` and confirm it exits successfully.
- [x] 3.2 Run `npm run build` and confirm it exits successfully.

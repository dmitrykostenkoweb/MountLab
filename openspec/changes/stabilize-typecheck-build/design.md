## Context

MountLab currently has a working package build, but the repository-level type-check fails on the runtime entry because TypeScript cannot resolve `.vue` single-file component imports. The runtime already uses Vue SFCs directly, so source-level verification needs a project declaration that teaches TypeScript how to type those imports.

The stabilization should stay narrowly scoped. It should not alter the public package API, CLI behavior, Vite plugin behavior, or runtime feature set. The intent is to make the existing source tree verifiable before adding the next MVP runtime capabilities.

## Goals / Non-Goals

**Goals:**

- Make `npm run typecheck` pass for the current source tree.
- Preserve the existing successful `npm run build` behavior.
- Add the minimum TypeScript support needed for Vue SFC imports.
- Remove unused runtime imports that add noise before further runtime UI work.

**Non-Goals:**

- No runtime UI feature work.
- No changes to generated CLI output.
- No changes to the package export surface.
- No dependency additions unless they are strictly required for type verification.

## Decisions

- Add a local Vue SFC module declaration instead of changing runtime imports.
  - Rationale: the runtime entry naturally imports `WorkbenchApp.vue`, and Vue SFC imports are expected in this codebase. A project-level declaration is the smallest fix and keeps the runtime build path unchanged.
  - Alternative considered: avoid importing `.vue` from TypeScript. That would work around the type-check error, but it would make the runtime entry less idiomatic and could diverge from Vite/Vue conventions.

- Keep the declaration broad and lightweight.
  - Rationale: MountLab does not need per-component generated types for this stabilization. A `*.vue` module declaration returning a Vue component type is enough for TypeScript to validate imports.
  - Alternative considered: add generated SFC type tooling. That is heavier than needed for this package and would be better evaluated later if stricter SFC type-checking becomes a goal.

- Treat unused runtime imports as cleanup, not behavior change.
  - Rationale: removing unused imports reduces noise and avoids hiding real type or lint issues in later runtime work.
  - Alternative considered: leave imports as-is because TypeScript does not currently fail on them. That preserves noise that is easy to remove now while touching the same area.

## Risks / Trade-offs

- Broad `.vue` declarations provide module compatibility but not deep template or prop checking -> Accept for this stabilization; deeper SFC checking is outside scope.
- Touching TypeScript config or ambient declarations can affect emitted declarations -> Verify both `npm run typecheck` and `npm run build`.
- Removing imports is mechanically simple but could reveal stale assumptions in runtime files -> Keep cleanup limited to imports proven unused by the compiler/source.

## Context

The current MountLab registry is case-file driven:

```txt
MountLabConfig.cases
      │
      ▼
fast-glob resolves *.case.ts
      │
      ▼
virtual:mountlab/cases eagerly imports authored default exports
      │
      ▼
runtime receives ComponentCase[]
```

This model works well for deliberate fixture authoring, but it makes discovery depend on boilerplate. The runtime already consumes plain `ComponentCase` objects, so the least invasive path is to make the Vite plugin synthesize valid cases from `.vue` files before the registry reaches runtime.

## Goals / Non-Goals

**Goals:**

- Let a user see Vue components in MountLab without writing co-located `.case.ts` files.
- Preserve the current authored case format and validation behavior.
- Let authored cases override synthetic cases for the same component.
- Keep generated synthetic cases stable and deterministic.
- Avoid changing runtime rendering contracts.

**Non-Goals:**

- Infer required props from TypeScript AST in this change.
- Generate persistent `.case.ts` files automatically.
- Replace `mountlab add`; it remains useful for creating richer authored cases.
- Support non-Vue component file types.

## Decisions

1. Add `components?: string[]` to `MountLabConfig`.

   `cases` keeps its existing meaning and default. `components` controls direct `.vue` discovery. If `components` is omitted, existing projects keep the current case-file-only behavior unless implementation chooses a separate explicit default during a later migration.

   Alternative considered: reuse `cases` for both `.case.ts` and `.vue` files. That makes config shorter, but it blurs two different concepts: authored fixture modules and raw components.

2. Generate synthetic cases in `virtual:mountlab/cases`.

   The generated module can import Vue components and build valid `ComponentCase` objects:

   ```ts
   {
     id: 'product-card',
     title: 'Product Card',
     component: ProductCard,
     variants: [{ id: 'default', title: 'Default', props: {} }],
   }
   ```

   Runtime components do not need to know whether a case was authored or synthetic.

3. Pair authored cases with components by sidecar path.

   A component `src/components/ProductCard.vue` is considered covered by `src/components/ProductCard.case.ts`. For `src/components/product-card/index.vue`, the sidecar remains `src/components/product-card/ProductCard.case.ts`, matching existing `mountlab add` behavior.

   Authored cases can still import any component internally, but sidecar matching is only used to suppress the synthetic fallback.

4. Authored cases win over synthetic cases.

   If both a component and its sidecar case exist, only the authored case enters the registry. This prevents duplicate sidebar entries and keeps user-authored variants, events, wrapper, notes, and props schema authoritative.

5. Do not infer props in the first version.

   Synthetic cases should use one default variant with `{}` props. Components with required props may render their own fallback/error state or Vue warnings. That is acceptable for the first slice because it removes the file-creation requirement without introducing a fragile parser.

   Future work can add best-effort prop extraction from `defineProps`, default values, or schema hints.

6. Keep duplicate ID validation after merging.

   Synthetic IDs are derived from component stems using the same kebab-case rules as `mountlab add`. After authored and synthetic entries are merged, the existing duplicate ID diagnostic should still reject collisions and include all source paths.

## Risks / Trade-offs

- [Risk] Required props render poorly with empty synthetic props. -> Mitigation: keep authored cases as the upgrade path and document that synthetic cases are a starting point, not full fixtures.
- [Risk] Sidecar path matching misses unusual authored cases. -> Mitigation: only use matching to suppress auto-cases; duplicate ID validation catches remaining conflicts with readable diagnostics.
- [Risk] Adding many `.vue` files may clutter the sidebar. -> Mitigation: make `components` opt-in and let users narrow the glob.
- [Risk] Component IDs derived from file names can collide. -> Mitigation: run duplicate validation after merging synthetic and authored cases.

## Migration Plan

No existing project migration is required. Existing `cases` config and authored case files continue to work.

The playground can migrate by adding `components: ['src/components/**/*.vue']` and deleting `src/components/ProductCard.case.ts`. If richer examples are still needed, they can be represented later as optional authored cases rather than the minimum path.

## Open Questions

- Should new projects created by `mountlab init` include a default `components: ['src/**/*.vue']`, or should direct component discovery stay opt-in for now?
- Should the runtime visually mark synthetic cases so users understand that props, events, and notes are not authored yet?

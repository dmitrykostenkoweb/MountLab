## Why

`mountlab add` is the second step in the core MountLab workflow — without it, developers must hand-write `.case.ts` files from scratch every time they want to mount a component. The command removes friction by scaffolding a correctly structured, import-ready case file co-located with the component, letting the developer jump straight to defining variants instead of boilerplate.

## What Changes

- Implement `src/cli/commands/add.ts` — currently a no-op stub that only prints what it would do
- The command validates the target `.vue` file, infers component name, and writes a `.case.ts` scaffold next to the component
- Supports `--group`, `--wrapper`, `--dry-run`, `--force` CLI flags
- Special handling for `index.vue` files: infer component name from the parent folder

## Capabilities

### New Capabilities
- `cli-add`: The `mountlab add <component-path>` command — validation, name inference, case file scaffolding, all CLI flags, and index.vue handling

### Modified Capabilities
*(none — existing `cli-structure` spec is unaffected; the command is already registered in the CLI binary)*

## Impact

- `src/cli/commands/add.ts` — full rewrite of stub
- No new dependencies required (uses `node:fs`, `node:path` already in use by `init.ts`)
- Publishes no new exports; purely CLI behavior
- No impact on runtime UI, Vite plugin, or core types

## 1. Package Setup

- [x] 1.1 Add `@vitejs/plugin-vue` as devDependency; add `vue` and `vite` as peerDependencies in `package.json`
- [x] 1.2 Add `build:runtime` script to `package.json` (`vite build --config vite.runtime.config.ts`)
- [x] 1.3 Update `build` script to run `build:lib && build:runtime`
- [x] 1.4 Add `dist/runtime` to `files` array in `package.json`
- [x] 1.5 Create `vite.runtime.config.ts` — entry `src/runtime/index.ts`, output `dist/runtime/`, externalize `vue` + `virtual:mountlab/*`, plugin `@vitejs/plugin-vue`

## 2. Runtime Vue App — Skeleton

- [x] 2.1 Create `src/runtime/WorkbenchApp.vue` — root component, two-panel layout (sidebar + main), injects `mountlab:cases` and `mountlab:config`
- [x] 2.2 Create `src/runtime/components/Sidebar.vue` — lists cases by group, emits `select` on click
- [x] 2.3 Create `src/runtime/components/TopBar.vue` — shows selected case title, variant `<select>`, wrapper `<select>`
- [x] 2.4 Create `src/runtime/components/PreviewArea.vue` — renders `<component :is="wrapper"><component :is="case" v-bind="props" /></component>`
- [x] 2.5 Create `src/runtime/index.ts` — exports `WorkbenchApp` as default (entry for the runtime build)
- [x] 2.6 Verify `npm run build:runtime` produces `dist/runtime/index.js` without errors

## 3. Vite Plugin — Virtual Modules

- [x] 3.1 Implement `resolveId` for `virtual:mountlab/cases` → `\0mountlab:cases`
- [x] 3.2 Implement `load` for `\0mountlab:cases` — glob config.cases patterns using `fast-glob`, generate eager import statements
- [x] 3.3 Implement `resolveId` for `/__mountlab/entry.js` → `\0mountlab:entry`
- [x] 3.4 Implement `load` for `\0mountlab:entry` — generate bootstrap code (imports WorkbenchApp, cases, userConfig; calls setupApp; mounts app)
- [x] 3.5 Implement `configureServer` — add middleware for `GET /` returning the HTML shell (single `<div id="mountlab">` + script tag)
- [x] 3.6 Add `fast-glob` as dependency in `package.json`

## 4. Case Discovery — File Watcher

- [x] 4.1 In `configureServer`, add `chokidar` watcher (or use `server.watcher`) for glob patterns from config
- [x] 4.2 On `add`/`unlink` events: call `server.moduleGraph.invalidateModule()` on the cases virtual module
- [x] 4.3 On invalidation, send `server.ws.send({ type: 'full-reload' })` to the browser

## 5. `mountlab dev` Command

- [x] 5.1 Implement `runDev()` in `src/cli/commands/dev.ts`:
  - resolve `mountlab.config.ts` from cwd (dynamic import)
  - load user `vite.config.ts` via `loadConfigFromFile`
  - `mergeConfig(userConfig, { server: { port }, plugins: [mountlab(config)] })`
  - `createServer(mergedConfig)` → `server.listen()` → `server.printUrls()`
- [x] 5.2 Handle missing `mountlab.config.ts` gracefully (print actionable error, `process.exit(1)`)
- [x] 5.3 Handle port-in-use error (catch EADDRINUSE, print `Port X is already in use`)

## 6. Smoke Test

- [x] 6.1 Run `npm run build` — both targets succeed, no type errors
- [x] 6.2 In a test Vue project: `pnpm add -D /path/to/mountlab`, run `mountlab init`, `mountlab add`, `mountlab dev`
- [x] 6.3 Verify browser opens at `http://localhost:4300`, sidebar shows discovered cases
- [x] 6.4 Verify selecting a case renders the component in the preview area
- [x] 6.5 Verify adding a new `.case.ts` file while `dev` is running triggers a page reload and the new case appears

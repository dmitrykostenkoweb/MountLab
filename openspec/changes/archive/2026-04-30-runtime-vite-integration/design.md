## Context

Phase 1–3 of MountLab is complete: types, helpers, `init`, and `add` all work.
The project has no running dev server, no case discovery, and no UI. This design
covers the architecture for Phases 4–6 — making `mountlab dev` actually work.

The key constraint is that components must run inside the user's real Vite context
(aliases, CSS, plugins) while the workbench UI chrome can be pre-compiled. That
split drives every decision below.

## Goals / Non-Goals

**Goals:**
- `mountlab dev` starts a Vite server; the workbench loads in the browser
- User's `*.case.ts` and `.vue` files are transformed by the user's Vite config
- `setupApp(app)` from `mountlab.config.ts` installs user plugins once
- Component preview renders inline in the same Vue app (no iframe)
- Case files added/removed during a session are reflected after page reload

**Non-Goals:**
- Fine-grained HMR for case registry changes (full reload is acceptable in MVP)
- Iframe isolation for component preview (deferred to post-MVP)
- Props editor, Zod validation, event logger (separate phases)
- URL state persistence (separate phase)

## Decisions

### D1 — Virtual HTML, not file-based index.html

**Decision:** The Vite plugin injects middleware that handles `GET /` and returns
an HTML string. No `index.html` is written to the user's project or to a temp dir.

**Rationale:** Keeps the user's project clean. No `.mountlab/` directory to
`.gitignore`. Matches how Vitest UI and vite-plugin-inspect work.

**Alternative considered:** `mountlab init` writes a `.mountlab/index.html` and
`mountlab dev` sets `root` to `.mountlab/`. Rejected because it adds files to the
user's project and makes `init` a prerequisite for `dev`.

---

### D2 — Virtual entry module at `/__mountlab/entry.js`

**Decision:** The plugin resolves `/__mountlab/entry.js` as a virtual module and
generates its content at request time. The HTML `<script src="/__mountlab/entry.js">`
loads it.

The generated content:
```ts
import { createApp } from 'vue'
import WorkbenchApp from '@mountlab/vue/runtime'
import { cases } from 'virtual:mountlab/cases'
import userConfig from '/abs/path/to/mountlab.config.ts'

const app = createApp(WorkbenchApp)
app.provide('mountlab:cases', cases)
app.provide('mountlab:config', userConfig)
await userConfig.setupApp?.(app)
app.mount('#mountlab')
```

**Rationale:** The entry is generated (not pre-built) so it can embed the absolute
path to `mountlab.config.ts` at server start. It imports both the pre-compiled
runtime AND the live virtual module — making it the exact seam between the two
worlds.

**Alternative considered:** Serving a pre-built entry that fetches a JSON API for
cases. Rejected because dynamic `import(variable)` in a pre-built file misses
Vite's dep-optimization scan, causing a page reload after the first load every
time. The virtual entry lets Vite know all imports upfront.

---

### D3 — Pre-compiled runtime, externalized Vue

**Decision:** `src/runtime/` Vue SFCs are compiled via a separate `vite build`
step into `dist/runtime/index.js`. Vue and all Vite virtual modules
(`virtual:mountlab/*`) are externalized from this build.

`package.json`:
```json
"peerDependencies": { "vue": "^3.0.0", "vite": "^5.0.0" }
```

**Rationale:** `.vue` files in `node_modules` are not transformed by the user's
Vite by default. Pre-compiling solves this without asking users to add MountLab
to `optimizeDeps.include`. Externalizing Vue prevents two Vue instances on the
same page (Vue enforces singleton behavior for reactivity and provide/inject).

**Alternative considered:** Shipping `.vue` source files and relying on the user's
Vite to compile them. Requires patching the user's `vue()` plugin `include`
option — too invasive and fragile.

---

### D4 — Single Vue app, inline preview

**Decision:** `WorkbenchApp` is the root of a single `createApp()`. The workbench
chrome (sidebar, topbar, panels) and the component preview all live in the same
Vue app tree. The preview area renders the user's component via `<component :is>`.

**Rationale:** This is the core MountLab promise — components run in the same
context as the real app. Pinia stores, PrimeVue theme, i18n, injected values all
work because there is one Vue app. `setupApp` installs plugins once, globally.

**Alternative considered:** iframe per component. Rejected for MVP — requires
cross-frame `postMessage` for `setupApp`, makes Pinia state unavailable to the
preview, and adds significant complexity for zero MVP benefit.

---

### D5 — Eager case imports, full reload on change

**Decision:** `virtual:mountlab/cases` generates static `import` statements for
all discovered case files (eager, not lazy). When case files are added or removed,
the plugin invalidates the virtual module and sends a `full-reload` HMR event.

```ts
// virtual:mountlab/cases — generated content
import c0 from '/abs/path/Button.case.ts'
import c1 from '/abs/path/Card.case.ts'
export const cases = [c0, c1]
```

**Rationale:** Eager imports let Vite scan all dependencies at startup. HMR for
structural changes (new case file) is complex to get right. Full reload is
reliable and the delay is imperceptible for a local dev tool.

**Alternative considered:** Lazy imports with a client-side fetch for the registry.
Rejected — adds a round-trip API and requires runtime logic to handle unknown paths.

---

### D6 — Two-target build

**Decision:**
```
npm run build:lib      → tsup  (core, cli, plugin — no Vue SFCs)
npm run build:runtime  → vite build with vite.runtime.config.ts
npm run build          → build:lib && build:runtime
```

`vite.runtime.config.ts`:
- entry: `src/runtime/index.ts`
- output: `dist/runtime/`
- externals: `vue`, `virtual:mountlab/cases`, `virtual:mountlab/config`
- plugins: `@vitejs/plugin-vue`
- format: ES module

**Rationale:** tsup does not handle Vue SFCs. Keeping the two build steps separate
makes each simpler and independently cacheable in CI.

## Risks / Trade-offs

**[Risk] User's vite.config has no `vue()` plugin**
→ Unlikely (all Vue 3 + Vite projects need it), but if missing, `.vue` wrappers
won't transform. Mitigation: the plugin validates and injects `@vitejs/plugin-vue`
if not already present in the resolved config.

**[Risk] `mountlab.config.ts` uses dynamic imports or top-level await**
→ Vite handles this for user files, but the generated entry's `await setupApp`
must be in an async context. Mitigation: wrap the entire entry in a top-level
async IIFE or use ES2022 top-level await (Vite supports it).

**[Risk] Absolute path to `mountlab.config.ts` in the virtual entry breaks on Windows**
→ Path separators differ. Mitigation: normalize to forward slashes in the plugin
before embedding in the generated string (Vite accepts `/` on all platforms).

**[Risk] `dist/runtime/` is not included in the published package**
→ `package.json` `files` field must include `dist/runtime/`. Easy to miss.
Mitigation: add an explicit entry to `files` and a pre-publish smoke test.

## Open Questions

- Should the plugin auto-inject `@vitejs/plugin-vue` when absent, or throw a
  clear error telling the user to add it? (Recommendation: throw with a helpful
  message — less magic, easier to debug.)
- Should `mountlab dev --open` launch the browser automatically? (Defer to v0.2
  per PRD, but the implementation slot is in `dev.ts`.)

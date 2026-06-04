# MountLab — PRD

## 1. Summary pomysłu

**MountLab** to dev-only narzędzie dla projektów **Vue 3 + Vite**, instalowane jako paczka npm/dev dependency. Jego celem jest umożliwienie developerowi pracy nad pojedynczym komponentem w izolacji, ale nadal **wewnątrz prawdziwego kontekstu aplikacji**: z tym samym Vite configiem, aliasami, Tailwindem, PrimeVue, Pinia, globalnymi pluginami, wrapperami i dependency tree.

Problem, który rozwiązuje MountLab:

> Developer nie chce przeklikiwać całej aplikacji, wizardów, routingu ani flow biznesowego tylko po to, żeby zmienić layout, style, propsy albo stan komponentu typu card, form, modal, panel czy summary step.

MountLab nie jest klasyczną biblioteką komponentów ani dokumentacją design systemu. To **component workbench**: lokalny warsztat do szybkiego mountowania komponentów z wybranymi propsami, wariantami danych, wrapperami i walidacją runtime.

Podstawowy workflow:

```bash
pnpm add -D @mountlab/vue
pnpm mountlab init
pnpm mountlab add src/components/ProductCard.vue
pnpm mountlab dev
```

Po wykonaniu `mountlab add`, narzędzie generuje obok komponentu plik typu:

```txt
ProductCard.vue
ProductCard.case.ts
```

W `ProductCard.case.ts` developer definiuje komponent, warianty, propsy, wrapper i eventy.

MountLab startuje na osobnym porcie, np. `http://localhost:4300`, ale działa z poziomu projektu użytkownika, dzięki czemu komponenty mają dostęp do tych samych zależności i konfiguracji co normalna aplikacja.

---

## 2. Product positioning

### 2.1. One-liner

**MountLab lets Vue developers mount and tweak individual components inside their real app context — without clicking through the whole app.**

### 2.2. Krótszy tagline

**Stop clicking through your app to style one component.**

### 2.3. Czym MountLab jest

MountLab to:

- component workbench,
- dev-only Vue/Vite tool,
- lokalny preview server,
- system component cases/variants,
- narzędzie do szybkiego testowania propsów i stanów komponentu,
- wrapper-based preview environment.

### 2.4. Czym MountLab nie jest

MountLab nie jest na start:

- Storybookiem 2.0,
- dokumentacją design systemu,
- narzędziem do budowania publicznych bibliotek komponentów,
- pełnym visual regression frameworkiem,
- frameworkiem testowym,
- multi-framework tool dla React/Vue/Svelte,
- alternatywą dla całej aplikacji.

---

## 3. Główny problem

W realnych aplikacjach frontendowych komponenty często są głęboko osadzone w flow aplikacji. Przykłady:

- card pokazujący status encji,
- formularz używany tylko w konkretnym modalu,
- modal potwierdzenia,
- panel podsumowania wizardu,
- komponent tabeli z niestandardowym layoutem,
- komponent empty/error/loading state,
- komponent zależny od PrimeVue/Tailwind/theme/store.

Obecny workflow często wygląda tak:

1. Developer zmienia style albo logikę komponentu.
2. Aplikacja się przeładowuje.
3. Trzeba kliknąć kilka/kilkanaście kroków flow.
4. Dopiero wtedy można zobaczyć komponent.
5. Mała poprawka CSS.
6. Cały proces od nowa.

To zabija tempo pracy i prowadzi do frustracji.

MountLab ma skrócić ten loop do:

1. Odpal MountLab.
2. Wybierz komponent.
3. Wybierz wariant danych.
4. Zmieniaj komponent i natychmiast widź efekt.

---

## 4. Target users

### 4.1. Primary user

Frontend developer pracujący w dużej aplikacji Vue 3 + Vite, który często buduje i styluje komponenty osadzone głęboko w aplikacji.

### 4.2. Secondary users

- UX/UI developer,
- frontend-heavy fullstack developer,
- designer-dev pracujący w Figma + kodzie,
- zespół utrzymujący internal UI components,
- QA/dev chcący szybko podejrzeć różne stany komponentu.

---

## 5. Goals

### 5.1. Product goals

- Umożliwić mountowanie pojedynczych komponentów Vue w izolowanym UI.
- Zachować dostęp do realnego kontekstu aplikacji użytkownika.
- Umożliwić szybkie definiowanie wariantów danych.
- Umożliwić wybór wrappera dla komponentu.
- Umożliwić edycję propsów przez JSON input.
- Zapewnić prosty CLI flow: `init`, `add`, `dev`.
- Umożliwić auto-discovery plików `*.case.ts`.

### 5.2. Developer experience goals

- Minimalny próg wejścia.
- Zero centralnego ręcznego rejestrowania komponentów w dużej liście.
- Case file powinien żyć obok komponentu.
- Tool powinien działać na osobnym porcie.
- Tool powinien korzystać z Vite configu projektu.
- Tool powinien być opcjonalny i dev-only.
- Tool nie powinien zanieczyszczać produkcyjnego kodu komponentu.

---

## 6. Non-goals for MVP

W MVP nie robimy:

- pełnej dokumentacji komponentów jak Storybook,
- publikowania statycznej dokumentacji,
- visual regression,
- screenshot testing,
- AI fixture generation,
- integracji CI,
- obsługi React/Svelte/Angular,
- obsługi Nuxt,
- obsługi Webpack,
- automatycznej perfekcyjnej inferencji typów TypeScript,
- pełnego mockowania API,
- plugin marketplace,
- rozbudowanego design system managera.

---

## 7. Core concept: Component Case

Developer definiuje komponent do pracy przez plik case obok komponentu.

Przykład struktury:

```txt
src/components/product-card/
  ProductCard.vue
  ProductCard.case.ts
```

Przykład case:

```ts
import { defineComponentCase } from "@mountlab/vue";
import ProductCard from "./ProductCard.vue";

export default defineComponentCase({
  id: "product-card",
  title: "Product Card",
  group: "Inventory",

  component: ProductCard,
  wrapper: "default",

  variants: [
    {
      id: "default",
      title: "Default",
      props: {
        product: {
          id: "p-1",
          name: "Paracetamol 500mg",
          quantity: 12,
        },
        selected: false,
      },
    },
    {
      id: "selected",
      title: "Selected",
      props: {
        product: {
          id: "p-1",
          name: "Paracetamol 500mg",
          quantity: 12,
        },
        selected: true,
      },
    },
    {
      id: "long-name",
      title: "Long product name",
      props: {
        product: {
          id: "p-1",
          name: "Bardzo długa nazwa produktu medycznego, która może rozwalić layout",
          quantity: 12,
        },
        selected: false,
      },
    },
  ],

  events: ["click", "select"],
});
```

---

## 8. CLI commands

### 8.1. `mountlab init`

Initializes MountLab in existing Vue/Vite project.

Command:

```bash
pnpm mountlab init
```

Creates:

```txt
mountlab.config.ts
src/mountlab/wrappers/DefaultWrapper.vue
```

Example generated config:

```ts
import { defineMountLabConfig } from "@mountlab/vue";
import DefaultWrapper from "./src/mountlab/wrappers/DefaultWrapper.vue";

export default defineMountLabConfig({
  port: 4300,

  cases: ["src/**/*.case.ts"],

  wrappers: {
    default: DefaultWrapper,
  },

  defaultWrapper: "default",

  setupApp(app) {
    // Add app plugins here, for example:
    // app.use(createPinia())
    // app.use(PrimeVue)
  },
});
```

Acceptance criteria:

- If `mountlab.config.ts` already exists, command does not overwrite without `--force`.
- Command prints created files.
- Command supports `--dry-run`.
- Generated config is valid TypeScript.

---

### 8.2. `mountlab add <component-path>`

Generates a `.case.ts` file for selected Vue component.

Command:

```bash
pnpm mountlab add src/components/ProductCard.vue
```

Generated result:

```txt
src/components/ProductCard.vue
src/components/ProductCard.case.ts
```

Generated file:

```ts
import { defineComponentCase } from "@mountlab/vue";
import ProductCard from "./ProductCard.vue";

export default defineComponentCase({
  id: "product-card",
  title: "Product Card",
  group: "Components",

  component: ProductCard,
  wrapper: "default",

  variants: [
    {
      id: "default",
      title: "Default",
      props: {
        // TODO: add props
      },
    },
  ],

  events: [
    // 'click',
    // 'submit',
  ],
});
```

Supported options:

```bash
pnpm mountlab add src/components/ProductCard.vue --group Inventory
pnpm mountlab add src/components/ProductCard.vue --wrapper card
pnpm mountlab add src/components/ProductCard.vue --dry-run
pnpm mountlab add src/components/ProductCard.vue --force
```

Acceptance criteria:

- Validates that component file exists.
- Validates that file extension is `.vue`.
- Generates stable kebab-case `id` from component name.
- Generates human-readable `title` from component name.
- Does not overwrite existing case file unless `--force` is used.
- Supports `--dry-run`.
- Uses relative import path.
- Handles `index.vue` reasonably.

Special case for `index.vue`:

```txt
src/components/product-card/index.vue
```

Generated case:

```txt
src/components/product-card/ProductCard.case.ts
```

The component name should be inferred from the folder name if possible.

---

### 8.3. `mountlab dev`

Starts MountLab dev server on a separate port.

Command:

```bash
pnpm mountlab dev
```

Behavior:

- Loads `mountlab.config.ts`.
- Loads/merges user Vite config.
- Starts Vite dev server on configured port.
- Auto-discovers case files based on config glob.
- Serves MountLab UI.

Acceptance criteria:

- Default port is `4300`.
- Port can be configured.
- If port is taken, shows useful error.
- UI opens at `http://localhost:<port>`.
- HMR works for component changes.
- HMR works for case file changes.
- Uses user project dependencies.
- Uses user project aliases.

---

## 9. Global config

File:

```txt
mountlab.config.ts
```

Example:

```ts
import { defineMountLabConfig } from "@mountlab/vue";
import PrimeVue from "primevue/config";
import { createPinia } from "pinia";

import DefaultWrapper from "./src/mountlab/wrappers/DefaultWrapper.vue";
import ModalWrapper from "./src/mountlab/wrappers/ModalWrapper.vue";

export default defineMountLabConfig({
  port: 4300,

  cases: ["src/**/*.case.ts"],

  setupApp(app) {
    app.use(createPinia());
    app.use(PrimeVue);
  },

  wrappers: {
    default: DefaultWrapper,
    modal: ModalWrapper,
  },

  defaultWrapper: "default",
});
```

Config fields:

| Field            | Required | Description                                                                |
| ---------------- | -------: | -------------------------------------------------------------------------- |
| `port`           |       No | Dev server port. Default: `4300`.                                          |
| `cases`          |       No | Glob patterns for case discovery. Default: `src/**/*.case.ts`.             |
| `setupApp`       |       No | Function called with Vue app instance. Used for Pinia, PrimeVue, i18n etc. |
| `wrappers`       |       No | Named wrapper components.                                                  |
| `defaultWrapper` |       No | Default wrapper key.                                                       |
| `viewports`      |       No | Named viewport presets. **Planned for v0.2.**                              |

---

## 10. Wrapper system

Wrapper lets developer render component inside custom layout/context.

Example wrapper:

```vue
<script setup lang="ts">
import Toast from "primevue/toast";
</script>

<template>
  <div class="min-h-screen bg-surface-100 text-ink">
    <header class="h-14 border-b px-4 flex items-center">
      MountLab App Shell
    </header>

    <main class="p-6">
      <slot />
    </main>

    <Toast />
  </div>
</template>
```

Supported use cases:

- empty wrapper,
- app shell wrapper,
- modal wrapper,
- form page wrapper,
- full-screen wrapper,
- table page wrapper,
- kiosk/full HD wrapper.

Acceptance criteria:

- Case can specify `wrapper`.
- UI allows changing wrapper at runtime.
- If case wrapper is missing, fallback to default wrapper.
- If default wrapper is missing, render with built-in empty wrapper.

---

## 11. Variants

Variant is a named component state.

Example:

```ts
variants: [
  {
    id: "default",
    title: "Default",
    props: {
      label: "Save",
      disabled: false,
    },
  },
  {
    id: "disabled",
    title: "Disabled",
    props: {
      label: "Save",
      disabled: true,
    },
  },
];
```

Variant fields:

| Field   | Required | Description                |
| ------- | -------: | -------------------------- |
| `id`    |      Yes | Stable variant ID.         |
| `title` |       No | Human-readable label.      |
| `props` |       No | Props passed to component. |
| `notes` |       No | Notes displayed in UI.     |

Acceptance criteria:

- UI lists variants for selected component.
- Selecting variant updates preview.
- Variant props are shown in JSON editor.
- URL can encode selected case and variant.

---

## 12. Props editor

MountLab UI should provide JSON editor for props.

MVP can use textarea. Later versions can use CodeMirror or Monaco.

Required behavior:

- Show current props as JSON.
- Let developer edit props manually.
- Parse JSON.
- Show JSON parse errors.
- Re-render component with edited props.

Acceptance criteria:

- Invalid JSON does not crash app.
- Developer can reset props to selected variant.
- Developer can copy current props.

---

## 13. Event logger

Component events should be observable in UI.

Case example:

```ts
events: ["click", "submit", "update:modelValue"];
```

Renderer should bind handlers for listed events and log emitted payloads.

UI example:

```txt
Events
[12:31:08] submit { id: "p-1" }
[12:31:12] update:modelValue "new value"
```

Acceptance criteria:

- Events listed in case are captured.
- Event name and payload are displayed.
- Event log can be cleared.
- Event logger does not break normal component behavior.

---

## 15. MountLab UI

### 15.1. Layout

Recommended UI layout:

```txt
┌────────────────────────────────────────────────────────────┐
│ Topbar: case title, variant, wrapper, viewport              │
├───────────────┬──────────────────────────────┬─────────────┤
│ Sidebar       │ Preview                      │ Right Panel │
│ Components    │ Mounted component             │ Props JSON  │
│ Search        │                              │ Validation  │
│ Groups        │                              │ Events      │
└───────────────┴──────────────────────────────┴─────────────┘
```

### 15.2. Sidebar

Sidebar features:

- list discovered cases,
- group by `group` field,
- fallback grouping by folder path,
- search by title/id/path.

### 15.3. Topbar

Topbar features:

- selected component case,
- variant selector,
- wrapper selector.

### 15.4. Preview

Preview features:

- render selected component,
- apply selected wrapper,
- apply selected props,
- show render errors without crashing whole app.

### 15.5. Right panel

Right panel features:

- props JSON editor,
- validation result,
- event log,
- notes.

---

## 16. URL state

MountLab should encode current selection in URL.

Example:

```txt
http://localhost:4300/?case=product-card&variant=long-name&wrapper=default
```

Acceptance criteria:

- Opening URL restores selected case.
- Opening URL restores variant.
- Opening URL restores wrapper.
- Invalid URL params fallback gracefully.

---

## 17. Architecture proposal

Recommended package structure:

```txt
packages/
  cli/
    src/
      commands/init.ts
      commands/add.ts
      commands/dev.ts

  core/
    src/
      defineComponentCase.ts
      defineMountLabConfig.ts
      types.ts
      validation.ts

  vue/
    src/
      runtime/
        MountLabApp.vue
        CaseRenderer.vue
        WrapperRenderer.vue
        PropsEditor.vue
        EventLog.vue
        Sidebar.vue
      index.ts

  vite-plugin/
    src/
      plugin.ts
      virtualModules.ts
      caseDiscovery.ts
```

Alternative for MVP:

```txt
packages/mountlab-vue/
  src/
    cli/
    core/
    runtime/
    vite-plugin/
```

For speed, start with one package. Split later only if needed.

---

## 18. Vite integration

`mountlab dev` should:

1. Resolve project root.
2. Load user `vite.config.ts`.
3. Load `mountlab.config.ts`.
4. Merge config.
5. Inject MountLab Vite plugin.
6. Start Vite server on MountLab port.

Pseudo-code:

```ts
import { createServer, mergeConfig, loadConfigFromFile } from "vite";
import { mountLabPlugin } from "@mountlab/vue/vite";

const userViteConfig = await loadUserViteConfig();
const mountLabConfig = await loadMountLabConfig();

const server = await createServer(
  mergeConfig(userViteConfig, {
    server: {
      port: mountLabConfig.port ?? 4300,
    },
    plugins: [mountLabPlugin({ config: mountLabConfig })],
  }),
);

await server.listen();
server.printUrls();
```

Acceptance criteria:

- User aliases work.
- User CSS imports work.
- User Vue plugin works.
- HMR works.
- MountLab virtual registry updates when case files change.

---

## 19. Virtual modules

MountLab Vite plugin should expose virtual modules:

```ts
virtual: mountlab / config;
virtual: mountlab / cases;
```

`virtual:mountlab/cases` exports discovered cases:

```ts
export const cases = [
  () => import("/absolute/path/src/components/ProductCard.case.ts"),
  () => import("/absolute/path/src/components/Modal.case.ts"),
];
```

Or eager for MVP:

```ts
import case0 from "/absolute/path/src/components/ProductCard.case.ts";
import case1 from "/absolute/path/src/components/Modal.case.ts";

export const cases = [case0, case1];
```

Acceptance criteria:

- Case discovery works from config glob.
- Adding new case file updates registry after restart, or with watcher if implemented.
- Invalid case file shows useful error.

---

## 20. Type definitions

Core types:

```ts
import type { Component, App } from "vue";

export interface MountLabConfig {
  port?: number;
  cases?: string[];
  setupApp?: (app: App) => void | Promise<void>;
  wrappers?: Record<string, Component>;
  defaultWrapper?: string;
  viewports?: Record<string, Viewport | null>;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ComponentCase<TProps = Record<string, unknown>> {
  id: string;
  title?: string;
  group?: string;
  component: Component;
  wrapper?: string;
  variants: ComponentVariant<TProps>[];
  events?: string[];
  notes?: string;
}

export interface ComponentVariant<TProps = Record<string, unknown>> {
  id: string;
  title?: string;
  props?: TProps;
  notes?: string;
}
```

Helper functions:

```ts
export function defineMountLabConfig(config: MountLabConfig): MountLabConfig;

export function defineComponentCase<TProps>(
  componentCase: ComponentCase<TProps>,
): ComponentCase<TProps>;
```

---

## 21. Rendering strategy

Renderer should:

1. Load selected case.
2. Resolve selected variant.
3. Resolve props from variant/editor.
4. Resolve selected wrapper.
5. Bind event listeners.
6. Render component using dynamic component.

Pseudo-template:

```vue
<template>
  <component :is="WrapperComponent">
    <component
      :is="SelectedComponent"
      v-bind="currentProps"
      v-on="eventHandlers"
    />
  </component>
</template>
```

Acceptance criteria:

- Component renders with props.
- Wrapper slot works.
- Events are captured.
- Render errors are displayed in UI.

---

## 22. Error handling

MountLab should handle:

- invalid config,
- missing wrapper,
- invalid case object,
- duplicate case ID,
- invalid JSON,
- schema validation error,
- component render error,
- missing component file in CLI add,
- existing `.case.ts` file.

Acceptance criteria:

- Errors are readable.
- Errors do not crash the whole dev server when avoidable.
- Duplicate case IDs are reported clearly.

---

## 23. MVP scope

### 23.1. MVP v0.1 must include

- npm/dev dependency package,
- CLI command `init`,
- CLI command `add`,
- CLI command `dev`,
- separate Vite dev server port,
- `mountlab.config.ts`,
- `defineComponentCase`,
- auto-discovery of `*.case.ts`,
- component list UI,
- variant selector,
- wrapper selector,
- dynamic component preview,
- JSON props editor,
- optional Zod validation,
- basic event logger,
- URL state for case/variant/wrapper.

### 23.2. MVP v0.1 should not include

- AI fixture generation,
- automatic TypeScript-to-schema generation,
- MSW integration,
- screenshots,
- visual regression,
- CI integration,
- static build/publish mode,
- Nuxt support.

---

## 24. Future roadmap

### v0.2

- Better search/sidebar UX.
- Viewport presets.
- Notes per case/variant.
- Improved error overlay.
- Copy current preview URL.
- Support `--open` flag for dev command.
- Better generated case templates.

### v0.3

- Valibot adapter.
- Generated sample JSON from schema.
- Save edited props as new variant.
- File write endpoint for saving variants.
- Pinia setup helpers.
- Basic accessibility checks with axe-core.

### v0.4

- MSW adapter for component-level API mocks.
- Latency simulator.
- Error state simulator.
- Screenshot button.
- Export Playwright test snippet.

### v1.0

- Optional props metadata inference from Vue SFC.
- Optional TypeScript type to JSON schema flow.
- Static build for shareable internal component workbench.
- Visual regression hooks.
- AI-assisted fixture generation.

---

## 25. Important technical decisions

### 25.1. Use case files next to components

Decision:

```txt
Component.vue
Component.case.ts
```

Reason:

- natural developer workflow,
- less central config hell,
- easier maintenance,
- similar mental model to colocated tests.

### 25.2. Do not put MountLab config inside production component

Avoid:

```ts
defineComponentCase({ ... })
```

inside `.vue` files.

Reason:

- production component stays clean,
- dev-only tooling is isolated,
- lower mental overhead.

### 25.3. Validation should be schema-first

Do not promise automatic runtime TypeScript validation in MVP.

Reason:

- TypeScript disappears at runtime,
- TS AST inference is complex,
- schemas are explicit and reliable.

### 25.4. Vue 3 + Vite only for MVP

Reason:

- clear scope,
- easier implementation,
- avoids Nuxt/Webpack complexity.

---

## 26. Example user journey

### Scenario: developer wants to work on ProductCard

1. Developer installs MountLab:

```bash
pnpm add -D @mountlab/vue
```

2. Initializes config:

```bash
pnpm mountlab init
```

3. Adds component case:

```bash
pnpm mountlab add src/components/ProductCard.vue --group Inventory
```

4. Edits generated `ProductCard.case.ts` and adds variants.

5. Starts MountLab:

```bash
pnpm mountlab dev
```

6. Opens `http://localhost:4300`.

7. Selects ProductCard.

8. Switches between `default`, `selected`, `long-name` variants.

9. Edits props JSON manually.

10. If schema exists, MountLab validates data.

11. Developer changes component styles and sees HMR instantly.

---

## 27. Success metrics

MVP is successful if:

- developer can add first component case in under 2 minutes,
- component renders with project dependencies and theme,
- HMR works reliably,
- developer can switch variants without touching app flow,
- developer can edit props JSON and see changes instantly,
- wrapper system solves layout/context needs,
- no production build impact.

---

## 28. Build plan for AI implementation

### Phase 1: Project skeleton

Create package structure, TypeScript setup, CLI entrypoint and basic exports.

Deliverables:

- package.json,
- tsconfig,
- CLI binary `mountlab`,
- exported helpers:
  - `defineMountLabConfig`,
  - `defineComponentCase`.

### Phase 2: CLI `init`

Implement config and wrapper generation.

Deliverables:

- `mountlab init`,
- generated `mountlab.config.ts`,
- generated `DefaultWrapper.vue`,
- `--dry-run`,
- `--force`.

### Phase 3: CLI `add`

Implement component case generation.

Deliverables:

- validate `.vue` file,
- infer component name,
- generate `.case.ts`,
- support `--group`, `--wrapper`, `--dry-run`, `--force`,
- handle `index.vue`.

### Phase 4: Vite dev server

Implement `mountlab dev`.

Deliverables:

- load user Vite config,
- load MountLab config,
- start Vite server on separate port,
- serve runtime app,
- inject virtual modules.

### Phase 5: Case discovery

Implement glob discovery and virtual case registry.

Deliverables:

- read `cases` globs from config,
- generate `virtual:mountlab/cases`,
- detect duplicate IDs,
- show useful errors.

### Phase 6: Runtime UI

Implement basic MountLab app.

Deliverables:

- sidebar case list,
- variant selector,
- wrapper selector,
- preview area,
- right panel.

### Phase 7: Props editor

Implement JSON props editor.

Deliverables:

- show selected variant props,
- edit JSON,
- parse errors,
- reset to variant.

### Phase 8: Event logger

Implement event binding/logging.

Deliverables:

- capture configured events,
- display event name/payload/time,
- clear log.

### Phase 10: Polish and docs

Deliverables:

- README,
- quick start,
- examples,
- known limitations,
- example Vue app.

---

## 29. Example README quick start

````md
# MountLab

MountLab is a local component workbench for Vue 3 + Vite apps.

## Install

\```bash
pnpm add -D @mountlab/vue
\```

## Init

\```bash
pnpm mountlab init
\```

## Add your first component

\```bash
pnpm mountlab add src/components/ProductCard.vue
\```

## Start

\```bash
pnpm mountlab dev
\```

Open http://localhost:4300.
````

---

## 30. Open questions

- Should CLI binary be `mountlab` even if package is scoped?
- Should MVP use CodeMirror immediately or simple textarea?
- Should Zod be peer dependency or optional dependency?
- Should wrappers be configured as imported components or file paths?
- Should case registry be eager or lazy-loaded?
- Should static build mode exist later?

---

## 31. Recommended package name

Recommended:

```txt
@mountlab/vue
```

CLI:

```txt
mountlab
```

Reason:

- `@mountlab/vue` leaves room for future packages,
- CLI remains simple,
- product name is easy to remember.

Potential package split later:

```txt
@mountlab/core
@mountlab/vue
@mountlab/vite-plugin
@mountlab/msw
@mountlab/playwright
```

For MVP, keep it as one package unless complexity forces a split.

---

## 32. Final recommendation

Build MountLab as a focused Vue 3 + Vite component workbench with this core promise:

> Mount any component, in your real app context, with variants, wrappers and editable props — without clicking through your app.

Do not compete with Storybook on documentation. Compete on speed, simplicity and real-app context.

MVP should be brutally small:

- `init`,
- `add`,
- `dev`,
- `*.case.ts`,
- variants,
- wrappers,
- JSON props editor,
- schema validation,
- event logger.

Everything else can wait.

# MountLab

> **Status: early skeleton — Phase 1 complete.** API types and CLI entrypoint are defined. Implementation phases coming next.

**Stop clicking through your app to style one component.**

MountLab is a local component workbench for **Vue 3 + Vite** apps. Mount any component in your real app context — with the same Vite config, aliases, Tailwind, PrimeVue, Pinia, and plugins — without clicking through flows or wizards.

---

## Install

```bash
pnpm add -D @mountlab/vue
```

## Init

```bash
pnpm mountlab init
```

## Add your first component

```bash
pnpm mountlab add src/components/ProductCard.vue
```

## Start

```bash
pnpm mountlab dev
```

Open `http://localhost:4300`.

---

## How it works

`mountlab add` generates a `.case.ts` file next to your component:

```ts
// ProductCard.case.ts
import { defineComponentCase } from '@mountlab/vue'
import ProductCard from './ProductCard.vue'

export default defineComponentCase({
  id: 'product-card',
  title: 'Product Card',
  group: 'Inventory',
  component: ProductCard,
  wrapper: 'default',
  variants: [
    { id: 'default', title: 'Default', props: { selected: false } },
    { id: 'selected', title: 'Selected', props: { selected: true } },
    { id: 'long-name', title: 'Long name', props: { name: 'Very long product name that might break layout', selected: false } },
  ],
  events: ['click', 'select'],
})
```

Configure MountLab in `mountlab.config.ts`:

```ts
import { defineMountLabConfig } from '@mountlab/vue'
import DefaultWrapper from './src/mountlab/wrappers/DefaultWrapper.vue'

export default defineMountLabConfig({
  port: 4300,
  cases: ['src/**/*.case.ts'],
  wrappers: { default: DefaultWrapper },
  defaultWrapper: 'default',
  setupApp(app) {
    // app.use(createPinia())
    // app.use(PrimeVue)
  },
})
```

---

## Architecture

| Layer | Path | Role |
|---|---|---|
| **Core** | `src/core/` | Types and helper functions exported to user projects |
| **CLI** | `src/cli/` | `mountlab` binary — `init`, `add`, `dev` commands |
| **Vite plugin** | `src/plugin/` | Integrates into the user's Vite config; exposes virtual modules |
| **Runtime** | `src/runtime/` | Vue 3 workbench UI (future phases) |

---

## Development

```bash
npm install
npm run build       # build to dist/
npm run dev         # watch mode
npm run typecheck   # type-check without emitting
```

---

## License

MIT

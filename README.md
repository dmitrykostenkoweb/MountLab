# MountLab

**Stop clicking through your app to style one component.**

MountLab is a local component workbench for **Vue 3 + Vite** apps. It runs inside your project context, using your Vite config, aliases, CSS pipeline, Vue plugins, wrappers, and dependency tree while letting you mount one component at a time.

## Quick Start

```bash
pnpm add -D @mountlab/vue
pnpm mountlab init
pnpm mountlab add src/components/ProductCard.vue
pnpm mountlab dev
```

Open `http://localhost:4300` by default, or set another `port` in `mountlab.config.ts`.

Use `pnpm mountlab dev --open` to request opening the workbench URL automatically.

## Case Files

`mountlab add` generates a `.case.ts` file next to your component:

```ts
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
  ],
  events: ['click', 'select'],
})
```

## Configuration

`mountlab init` creates `mountlab.config.ts` and a default wrapper:

```ts
import { defineMountLabConfig } from '@mountlab/vue'
import DefaultWrapper from './src/mountlab/wrappers/DefaultWrapper.vue'

export default defineMountLabConfig({
  port: 4300,
  cases: ['src/**/*.case.ts'],
  wrappers: { default: DefaultWrapper },
  defaultWrapper: 'default',
  viewports: {
    auto: null,
    mobile: { width: 390, height: 844 },
    desktop: { width: 1280, height: 800 },
  },
  setupApp(app) {
    // app.use(createPinia())
    // app.use(PrimeVue)
  },
})
```

## Implemented MVP Features

- CLI commands: `init`, `add`, and `dev`
- Auto-discovery of `*.case.ts` files
- Component list with grouping and search
- Variant selector
- Wrapper selector with fallback behavior
- Viewport presets
- Dynamic Vue component preview
- JSON props editor with reset/copy actions
- Optional runtime schema validation via `safeParse`-compatible schemas such as Zod
- Event logger for configured emitted events
- URL state for case, variant, wrapper, and viewport
- Copy current workbench URL

## Current Non-Goals

MountLab does not currently include static publishing, visual regression, screenshot testing, CI integration, AI fixture generation, Nuxt/Webpack support, or automatic TypeScript-to-runtime-schema generation.

## Smoke Check

For a manual end-to-end check against a Vue/Vite app:

```bash
pnpm add -D @mountlab/vue
pnpm mountlab init --force
pnpm mountlab add src/components/ProductCard.vue --group Inventory --force
pnpm mountlab dev --open
```

Then verify that the generated case appears in the sidebar, the default variant renders, props can be edited in the right panel, and component/style changes update through Vite HMR.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## License

MIT

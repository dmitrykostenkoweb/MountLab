import type { ComponentCase, MountLabConfig } from './types.js'

/**
 * Defines a MountLab configuration object with full TypeScript inference.
 * Place this in mountlab.config.ts at your project root.
 *
 * @example
 * ```ts
 * // mountlab.config.ts
 * import { defineMountLabConfig } from '@mountlab/vue'
 * import DefaultWrapper from './src/mountlab/wrappers/DefaultWrapper.vue'
 *
 * export default defineMountLabConfig({
 *   port: 4300,
 *   cases: ['src/**\/*.case.ts'],
 *   components: ['src/components/**\/*.vue'],
 *   wrappers: { default: DefaultWrapper },
 *   defaultWrapper: 'default',
 *   setupApp(app) {
 *     // app.use(createPinia())
 *   },
 * })
 * ```
 */
export function defineMountLabConfig(config: MountLabConfig): MountLabConfig {
  return config
}

/**
 * Defines a component case with full TypeScript inference for props.
 * Place this in a *.case.ts file co-located with your component.
 *
 * @example
 * ```ts
 * // ProductCard.case.ts
 * import { defineComponentCase } from '@mountlab/vue'
 * import ProductCard from './ProductCard.vue'
 *
 * export default defineComponentCase({
 *   id: 'product-card',
 *   title: 'Product Card',
 *   group: 'Inventory',
 *   component: ProductCard,
 *   wrapper: 'default',
 *   variants: [
 *     { id: 'default', title: 'Default', props: { selected: false } },
 *     { id: 'selected', title: 'Selected', props: { selected: true } },
 *   ],
 *   events: ['click', 'select'],
 * })
 * ```
 */
export function defineComponentCase<TProps>(
  componentCase: ComponentCase<TProps>,
): ComponentCase<TProps> {
  return componentCase
}

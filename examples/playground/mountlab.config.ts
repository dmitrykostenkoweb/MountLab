import { defineMountLabConfig } from '@mountlab/vue'
import DefaultWrapper from './src/mountlab/wrappers/DefaultWrapper.vue'
import CompactWrapper from './src/mountlab/wrappers/CompactWrapper.vue'

export default defineMountLabConfig({
  port: 4301,
  cases: ['src/**/*.case.ts'],
  wrappers: {
    default: DefaultWrapper,
    compact: CompactWrapper,
  },
  defaultWrapper: 'default',
  viewports: {
    auto: null,
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 900 },
    desktop: { width: 1280, height: 800 },
  },
})

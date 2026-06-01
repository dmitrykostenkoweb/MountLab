import { defineMountLabConfig } from '@mountlab/vue'

export default defineMountLabConfig({
  port: 4301,
  cases: ['src/**/*.case.ts'],
  viewports: {
    auto: null,
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 900 },
    desktop: { width: 1280, height: 800 },
  },
})

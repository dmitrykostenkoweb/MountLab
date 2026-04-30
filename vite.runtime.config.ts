import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/runtime/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'dist/runtime',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'vue',
        /^virtual:mountlab\//,
      ],
    },
  },
})

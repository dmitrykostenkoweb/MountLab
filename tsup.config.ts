import { defineConfig } from 'tsup'

export default defineConfig([
  // Library entrypoints (no shebang)
  {
    entry: {
      index: 'src/index.ts',
      'core/index': 'src/core/index.ts',
      'plugin/index': 'src/plugin/index.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: false,
  },
  // CLI entrypoint (needs Node shebang)
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])

import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: "@mountlab/vue/runtime",
        replacement: path.join(repoRoot, "src/runtime/index.ts"),
      },
      {
        find: "@mountlab/vue",
        replacement: path.join(repoRoot, "src/index.ts"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  optimizeDeps: {
    exclude: ["@mountlab/vue"],
  },
});

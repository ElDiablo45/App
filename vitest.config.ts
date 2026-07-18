import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/.git/**", "**/.worktrees/**"],
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
  },
})

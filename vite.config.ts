import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  root: "src",
  plugins: [solidPlugin()],
  test: {
    environment: "happy-dom",
  },
});

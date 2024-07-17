import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "package:": "/src",
      "@components": "@sv/components",
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  plugins: [],
});

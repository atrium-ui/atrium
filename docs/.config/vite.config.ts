import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "package:": "/src",
      "@components": "@atrium-ui/components",
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  plugins: [],
});

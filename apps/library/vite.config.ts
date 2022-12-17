/// <reference types="histoire" />

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag.startsWith("aui-"),
        },
      },
    }),
  ],
  base: "./",
  histoire: {
    outDir: "public",
    routerMode: "hash",
    setupFile: "src/histoire.setup.ts",
    storyMatch: ["**/docs/*.story.vue", "**/stories/*.story.vue"],
    storyIgnored: ["**/node_modules/!(@atrium-ui)/**", "**/dist/**", "**/components/**"],
    theme: {
      title: "Atrium UI",
      logo: {
        square: "/src/img/logo.svg",
        light: "/src/img/logo.svg",
        dark: "/src/img/logo.svg",
      },
    },
    tree: {
      order: (a, b) => a.localeCompare(b),
      groups: [
        {
          id: "top",
          title: "", // No toggle
        },
        {
          id: "docs",
          title: "", // No toggle
        },
        {
          id: "primitives",
          title: "Primitives",
        },
        {
          title: "Components",
          include: (file) => !file.title.includes("Serialize"),
        },
      ],
    },
  },
});

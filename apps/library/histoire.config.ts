import { defineConfig } from "histoire";
import { HstVue } from "@histoire/plugin-vue";
import vue from "@vitejs/plugin-vue";
import markdown from "vite-plugin-markdown";

export default defineConfig({
  plugins: [HstVue()],
  setupFile: "src/histoire.setup.ts",
  outDir: "dist",
  routerMode: "hash",
  storyMatch: ["../../components/*/stories/*.story.vue"],
  theme: {
    title: "SV Components",
    logo: {
      square: "/src/img/logo.svg",
      light: "/src/img/logo.svg",
      dark: "/src/img/logo.svg",
    },
  },
  tree: {
    order: (a: string, b: string) => a.localeCompare(b),
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
  vite: {
    base: "",
    plugins: [
      markdown({}),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith("sv-"),
          },
        },
      }),
    ],
    server: {
      fs: {
        allow: ["../../"],
      },
    },
  },
});

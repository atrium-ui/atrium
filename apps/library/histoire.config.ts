import { defineConfig } from "histoire";
import { HstVue } from "@histoire/plugin-vue";

export default defineConfig({
  plugins: [HstVue()],
  setupFile: "src/histoire.setup.ts",
  outDir: "../../public",
  routerMode: "hash",
  // storyMatch: ["../../components/*/stories/*.story.vue", "docs/**/*.story.vue"],
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
});

import { defaultColors, defineConfig } from "histoire";
import { HstVue } from "@histoire/plugin-vue";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [HstVue()],
  setupFile: "src/histoire.setup.ts",
  outDir: "dist",
  routerMode: "hash",
  storyMatch: ["./stories/*.story.vue", "../../pacakges/*/stories/*.story.vue"],
  theme: {
    title: "SV Components",
    logo: {
      square: "./src/img/logo.svg",
      light: "./src/img/logo.svg",
      dark: "./src/img/logo.svg",
    },
    colors: {
      gray: defaultColors.neutral,
      primary: defaultColors.amber,
    },
    // hideColorSchemeSwitch: true,
  },
  defaultStoryProps: {
    layout: {
      type: "grid",
      width: "95%",
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
        id: "input",
        title: "Inputs",
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
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith("a-"),
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

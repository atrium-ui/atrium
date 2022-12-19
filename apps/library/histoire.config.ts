import { defaultColors, defineConfig } from "histoire";
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
    title: "Atrium UI",
    logo: {
      square: "/src/img/logo.svg",
      light: "/src/img/logo.svg",
      dark: "/src/img/logo.svg",
    },
    colors: {
      gray: defaultColors.zinc,
      primary: defaultColors.amber,
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
            isCustomElement: (tag: string) => {
              return tag.startsWith("aui-") || tag.startsWith("material-");
            },
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

import solid from "@astrojs/solid-js";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  base: "/sv-frontend-library/mono/",
  site: "https://sv.pages.s-v.de",
  vite: {
    resolve: {
      alias: {
        "package:": "/src",
      },
    },
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    vue({
      jsx: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes("-"),
        },
      },
    }),
    // solid(),
    // react(),
    starlight({
      components: {
        ContentPanel: "./src/components/ContentPanel.astro",
      },
      title: "Atrium",
      customCss: ["./styles/custom.css"],
      logo: {
        dark: "./src/assets/atrium-dark.png",
        light: "./src/assets/atrium-light.png",
        replacesTitle: true,
        alt: "Atrium Logo",
      },
      social: {
        gitlab: "https://gitlab.s-v.de/sv-components/mono/",
      },
      sidebar: [
        {
          label: "Concept",
          link: "/concept",
        },
        {
          label: "Setup",
          link: "/setup",
        },
        {
          label: "Usage",
          link: "/usage",
        },
        {
          label: "Component Templates",
          collapsed: false,
          autogenerate: { directory: "components" },
        },
        {
          label: "Elements",
          collapsed: true,
          autogenerate: { directory: "elements" },
        },
        {
          label: "Packages",
          collapsed: false,
          autogenerate: { directory: "packages" },
        },
        {
          label: "Experimental",
          collapsed: true,
          autogenerate: { directory: "experimental" },
        },
      ],
    }),
  ],
});

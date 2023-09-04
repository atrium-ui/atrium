import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import lit from "@astrojs/lit";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  base: "/mono",
  experimental: {
    viewTransitions: true,
  },
  integrations: [
    lit(),
    tailwind({
      applyBaseStyles: false,
    }),
    starlight({
      title: "Atrium",
      customCss: ["./src/styles/custom.css"],
      social: {
        gitlab: "https://gitlab.s-v.de/sv-components/mono",
      },
      sidebar: [
        {
          label: "Installation",
          link: "/guides/installation",
        },
        {
          label: "Primitives",
          link: "/guides/primitives",
        },
        {
          label: "Development",
          link: "/guides/development",
        },
        {
          label: "Components",
          autogenerate: { directory: "components" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: "astro/assets/services/sharp" } },
});

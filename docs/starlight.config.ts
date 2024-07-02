import type starlight from "@astrojs/starlight";

export default {
  favicon: "favicon.png",
  title: "Atrium",
  customCss: ["./custom.css"],
  logo: {
    dark: "./assets/logo-dark.svg",
    light: "./assets/logo-light.svg",
    replacesTitle: true,
    alt: "Atrium Logo",
  },
  social: {
    gitlab: "https://gitlab.s-v.de/svp/atrium",
  },
  sidebar: [
    {
      label: "Getting Started",
      collapsed: false,
      items: [
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
      ],
    },
    {
      label: "Components",
      collapsed: false,
      autogenerate: { directory: "components" },
    },
    {
      label: "Elements",
      collapsed: false,
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
} satisfies Parameters<typeof starlight>[0];

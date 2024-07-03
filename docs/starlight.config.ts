import type starlight from "@astrojs/starlight";

const config: Parameters<typeof starlight>[0] = {
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
  tableOfContents: false,
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
  ],
};

if (import.meta.env.DEV) {
  config.sidebar?.unshift({
    label: "Development",
    badge: "Dev",
    collapsed: false,
    autogenerate: { directory: "experimental" },
  });
}

export default config;

import type starlight from "@astrojs/starlight";

const config: Parameters<typeof starlight>[0] = {
  favicon: "favicon.png",
  title: "Atrium",
  customCss: ["./src/custom.css"],
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
};

export default config;

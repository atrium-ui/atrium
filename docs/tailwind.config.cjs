// tailwind.config.cjs
const starlightPlugin = require("@astrojs/starlight-tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "../packages/components/templates/*.tsx",
  ],
  plugins: [starlightPlugin()],
};

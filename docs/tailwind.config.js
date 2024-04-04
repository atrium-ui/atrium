import starlightPlugin from "@astrojs/starlight-tailwind";

// Generated color palettes
const accent = { 200: "#e3c492", 600: "#d09d25", 900: "#442d00", 950: "#322000" };
const gray = {
  100: "#f6f6f7",
  200: "#ededef",
  300: "#c1c2c4",
  400: "#8b8b8f",
  500: "#57585b",
  700: "#37383b",
  800: "#26262a",
  900: "#18181a",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "../packages/components/src/*.tsx",
  ],
  theme: {
    extend: {
      colors: { accent, gray },
    },
  },
  plugins: [starlightPlugin()],
};

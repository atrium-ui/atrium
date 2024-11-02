import svgSprite from "svg-sprites/vite";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default {
  build: {
    lib: {
      formats: ["es", "cjs"],
      entry: "index.ts",
      fileName: "icons",
      name: "icons",
    },
  },
  plugins: [svgSprite({ dir: ["assets/*.svg"] })],
};

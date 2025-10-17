import path from "node:path";
import svgSprite from "../../dist/vite-plugin.js";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  plugins: [
    svgSprite({
      dir: [
        path.resolve("../assets/icons/**/*.svg"),
        path.resolve("../assets/icons2/*.svg"),
        `${path.dirname(require.resolve("@sv/icons"))}/*.svg`,
      ],
      transform: (code, file) => {
        console.warn("transform", file);
        return code.replaceAll("black", "currentColor");
      },
    }),
  ],
});

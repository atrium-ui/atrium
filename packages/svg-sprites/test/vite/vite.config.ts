import path from "node:path";
import svgSprite from "svg-sprites/vite";
import { defineConfig } from "vite";

const dir1 = path.resolve("./test/assets/icons/**/*.svg");
const dir2 = path.resolve("./test/assets/icons2/*.svg");

export default defineConfig({
  base: "",
  clearScreen: false,
  plugins: [
    svgSprite({
      dir: [dir1, dir2],
      transform: (code, file) => {
        console.warn("transform", file);
        return code.replaceAll("black", "currentColor");
      },
    }),
  ],
});

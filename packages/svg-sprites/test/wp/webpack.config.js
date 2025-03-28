import path from "node:path";

const dir1 = path.resolve("./test/assets/icons/**/*.svg");
const dir2 = path.resolve("./test/assets/icons2/*.svg");

export default {
  mode: "development",
  entry: path.resolve("./test/wp/main.js"),
  module: {
    rules: [
      {
        use: [
          {
            loader: "@sv/svg-sprites/loader",
            options: {
              dir: [dir1, dir2],
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: "main.bundle.js",
    path: path.resolve("./test/wp/dist"),
  },
};

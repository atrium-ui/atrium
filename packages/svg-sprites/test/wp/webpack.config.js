import path from "node:path";

const dir1 = path.resolve("../assets/icons/**/*.svg");
const dir2 = path.resolve("../assets/icons2/*.svg");

export default {
  mode: "development",
  entry: path.resolve("./main.js"),
  module: {
    rules: [
      {
        use: [
          {
            loader: "../../dist/webpack-loader.js",
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
    path: path.resolve("./dist"),
  },
};

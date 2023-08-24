import "./histoire.css";

import pkg from "../../package.json";

document.body.style.setProperty("--version", `'v${pkg.version}'`);

export function setupVue3({ app }) {
  // vue setup
}

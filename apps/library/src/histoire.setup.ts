import "./histoire.css";

import pkg from "../../../package.json";

const style = /*css*/ `
  .histoire-story-list::after {
    content: "v${pkg.version}";
    font-weight: bold;
    opacity: 0.2;
    position: absolute;
    left: 20px;
    bottom: 20px;
  }
`;

document.head.innerHTML += `<style>${style}</style>`;

export function setupVue3({ app }) {
  // vue setup
}

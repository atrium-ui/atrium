import "./histoire.css";

import pkg from "../../../package.json";

console.info(
  `%c${pkg.name}%c${pkg.version}`,
  "color:#fff;background-color:#333;border-radius:3px 0 0 3px;padding:1px 8px",
  "color:#fff;background-color:#404247;border-radius:0 3px 3px 0;padding:1px 8px"
);

const style = /*css*/ `
  .histoire-story-list::after {
    content: "${pkg.version}";
    font-weight: bold;
    opacity: 0.2;
    position: absolute;
    left: 20px;
    bottom: 20px;
  }
`;

document.head.innerHTML += `<style>${style}</style>`;

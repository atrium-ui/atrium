import { html } from "lit";
import "./slider/FraportSlider.js";

export default {
  tags: ["public"],
  args: {
    copy: "(Body) Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum ...",
  },
  render: (args) => {
    return html`
      <fra-carousel style="padding: 1.5rem;">
        ${new Array(12).fill(1).map((_, i) => {
          return html`
            <div style="display: block; flex: none; width: 100%; height: 400px;">
              <placeholder style="display: block; width: 100%; height: 100%; background: #EDEDF7;"></placeholder>
            </div>
          `;
        })}
      </fra-carousel>
    `;
  },
};

export const Fraport = {};

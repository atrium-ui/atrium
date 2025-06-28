import { html } from "lit";
import "./FraportCarousel.js";
import type { Story } from "../../../components/stories/stories.jsx";

export default (<Story>{
  tags: ["public"],
  args: {
    copy: "(Body) Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum ...",
  },
  argTypes: {
    copy: {
      description: "The text to be displayed in the carousel.",
    },
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
});

export const Fraport = {};

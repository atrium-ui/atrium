import { html } from "lit";
import "./FraportCarousel.js";
import type { Story } from "../../../components/stories/stories.jsx";

export default (<Story>{
  tags: ["public"],
  args: {
    count: 5,
    itemsPerPage: 3,
  },
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
  render: (args) => {
    const items = new Array(+args.count).fill(1);

    return html`
      <fra-carousel style="padding: 1.5rem;">
        ${items.map((_, i) => {
          return html`
            <div style="display: block; flex: none; width: ${100 / args.itemsPerPage}%; height: 320px;">
              <placeholder style="display: block; width: 100%; height: 100%; background: #EDEDF7;"></placeholder>
            </div>
          `;
        })}
      </fra-carousel>
    `;
  },
});

export const Fraport = {};

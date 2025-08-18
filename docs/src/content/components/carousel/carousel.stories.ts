import { html } from "lit";
import "./FraportCarousel.js";
import type { Story } from "../../../components/stories/stories.js";

export default (<Story>{
  tags: ["public"],
  args: {
    count: 5,
  },
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
});

export const Fraport: Story = {
  render: (args) => {
    const items = new Array(+args.count).fill(1);

    return html`
      <fra-carousel style="padding: 1.5rem;">
        ${items.map((_, i) => {
          return html`
            <div style="display: block; flex: none; height: 320px;" class="w-full md:w-1/2 lg:w-1/3">
              <placeholder style="display: block; width: 100%; height: 100%; background: #EDEDF7;"></placeholder>
            </div>
          `;
        })}
      </fra-carousel>
    `;
  },
};

export const _StripSingleItem: Story = {
  render: () => {
    return html`
      <div class="w-[405px] bg-zinc-300">
        <div class="pl-5 py-4">
          <a-track id="track" snap class="flex w-full overflow-visible">
            <div class="flex-none w-[230px] h-[138px]">
              <placeholder style="display: block; width: 100%; height: 100%; background: #EDEDF7;"></placeholder>
            </div>
          </a-track>
        </div>
      </div>
    `;
  },
};

export const _StripSnappingAtTheEnd: Story = {
  render: () => {
    return html`
      <div class="bg-zinc-300">
        <div class="pl-5 py-4">
          <a-track id="track" class="outline-2 outline-red-500 overflow-visible w-[800px] h-[undefinedpx]" snap="true" width="800" role="region">
            <canvas class="bg-white border-2" width="624" height="200" active=""></canvas><canvas class="bg-white border-2" width="223" height="200"></canvas><canvas class="bg-white border-2" width="291" height="200"></canvas><canvas class="bg-white border-2" width="573" height="200"></canvas><canvas class="bg-white border-2" width="344" height="200"></canvas><canvas class="bg-white border-2" width="483" height="200"></canvas><canvas class="bg-white border-2" width="642" height="200"></canvas><canvas class="bg-white border-2" width="482" height="200"></canvas><canvas class="bg-white border-2" width="548" height="200"></canvas><canvas class="bg-white border-2" width="402" height="200"></canvas>
          </a-track>
        </div>
      </div>
    `;
  },
};

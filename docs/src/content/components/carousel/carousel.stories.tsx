/* @jsxImportSource vue */
import { html } from "lit";
import "./FraportCarousel.js";
import type { Story } from "../../../components/stories/stories.js";
import { Image } from "package:/components/Image";
import { Carousel } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {
    count: 5,
  },
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
};

export const SomeSlider = {
  render: () => (
    <div>
      <Carousel>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
        <div class="h-[500px] w-full flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full"
          />
        </div>
      </Carousel>
    </div>
  ),
};

export const SomeSliderB = {
  render: () => (
    <div>
      <Carousel align="center">
        <div class="block aspect-square h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
        <div class="block aspect-video h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
        <div class="block aspect-3/4 h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
        <div class="block h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
        <div class="block aspect-square h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
        <div class="block h-[300px] flex-none p-2">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="h-full w-full object-cover"
          />
        </div>
      </Carousel>
    </div>
  ),
};

export const SomeSliderC = {
  render: () => (
    <div>
      <Carousel>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
        <a href="/" class="block w-full flex-none p-2 md:w-1/2 lg:w-1/3">
          <Image
            src={`${import.meta.env.BASE_URL}placeholder.svg`}
            class="aspect-square w-full object-cover"
          />
        </a>
      </Carousel>
    </div>
  ),
};

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
        <div class="py-4 pl-5">
          <a-track id="track" snap class="flex w-full overflow-visible">
            <div class="h-[138px] w-[230px] flex-none">
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
        <div class="py-4 pl-5">
          <a-track id="track" class="h-[undefinedpx] w-[800px] overflow-visible outline-2 outline-red-500" snap="true" width="800" role="region">
            <canvas class="border-2 bg-white" width="624" height="200" active=""></canvas><canvas class="border-2 bg-white" width="223" height="200"></canvas><canvas class="border-2 bg-white" width="291" height="200"></canvas><canvas class="border-2 bg-white" width="573" height="200"></canvas><canvas class="border-2 bg-white" width="344" height="200"></canvas><canvas class="border-2 bg-white" width="483" height="200"></canvas><canvas class="border-2 bg-white" width="642" height="200"></canvas><canvas class="border-2 bg-white" width="482" height="200"></canvas><canvas class="border-2 bg-white" width="548" height="200"></canvas><canvas class="border-2 bg-white" width="402" height="200"></canvas>
          </a-track>
        </div>
      </div>
    `;
  },
};

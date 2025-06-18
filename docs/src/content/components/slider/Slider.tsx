/* @jsxImportSource vue */

import { Image } from "package:/components/Image";
import { Slider } from "@components/src/vue/Slider";

export const SomeSlider = () => (
  <div>
    <Slider>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </div>
    </Slider>

    <Slider>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
      <a href="/" class="block h-[300px] flex-none p-2 active:ring-2">
        <Image src={`${import.meta.env.BASE_URL}placeholder.svg`} class="h-full w-full" />
      </a>
    </Slider>
  </div>
);

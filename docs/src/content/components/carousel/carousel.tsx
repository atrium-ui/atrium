/* @jsxImportSource vue */

import { Image } from "package:/components/Image";
import { Carousel } from "@components/src/vue/Carousel";

export const SomeSlider = () => (
  <div>
    <Carousel>
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
    </Carousel>

    <Carousel>
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
    </Carousel>
  </div>
);

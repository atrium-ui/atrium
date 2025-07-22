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
  </div>
);

export const SomeSliderB = () => (
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
);

export const SomeSliderC = () => (
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
);

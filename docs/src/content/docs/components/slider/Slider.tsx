/* @jsxImportSource vue */

import { Image } from "package:/components/atrium/Image.jsx";
import { Slider } from "@components/src/vue/Slider";

export const SomeSlider = () => (
  <div>
    <Slider>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[500px] w-full flex-none p-2">
        <Image class="h-full w-full" />
      </div>
    </Slider>

    <Slider>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
      <div class="h-[300px] flex-none p-2">
        <Image class="h-full w-full" />
      </div>
    </Slider>
  </div>
);

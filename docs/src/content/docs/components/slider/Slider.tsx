/* @jsxImportSource vue */

import { Image } from "package:/components/Image";
import { Slider } from "@components/src/vue/Slider";

export const SomeSlider = () => (
  <Slider>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
    <div class="h-[500px] w-full flex-none p-2">
      <Image />
    </div>
  </Slider>
);

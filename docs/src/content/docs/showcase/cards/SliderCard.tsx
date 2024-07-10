/* @jsxImportSource vue */

import { Slider } from "@components/src/vue/Slider";
import { Card } from "../Card";
import { Image } from "package:/components/Image";

export function SliderCard() {
  const data = new Array(10).fill(0);

  return (
    <Card class="py-3 pt-4">
      <div class="flex justify-center">
        <Slider class="w-[300px] overflow-visible">
          {data.map((n, i) => {
            return (
              <div key={n} class="pr-4">
                <Image
                  lightbox={true}
                  class="flex-none overflow-hidden rounded-md bg-black object-cover"
                  width={300}
                  height={300}
                />
              </div>
            );
          })}
        </Slider>
      </div>
    </Card>
  );
}

/* @jsxImportSource vue */

import { Slider } from "@components/src/vue/Slider";
import { Card } from "../Card";
import { Image } from "package:/components/Image";
import "@atrium-ui/elements/range";

export function SliderCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          Photos
        </h3>
        <p class="text-muted-foreground text-sm">Photos from your trip.</p>
      </div>
      <div class="flex justify-center">
        <Slider class="w-[300px] overflow-visible">
          {new Array(10).fill(0).map((n, i) => {
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

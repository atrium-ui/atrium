/* @jsxImportSource vue */

import { Animation } from "@components/src/vue/Animation";
import { Card } from "../Card";

export function AnimationCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          Animations
        </h3>
        <p class="text-muted-foreground text-sm">Powered by Rive</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <Animation
          class="h-[200px] w-[200px]"
          width={400}
          height={400}
          src="/atrium/animation/pie.riv"
        />

        <Animation
          class="h-[200px] w-[200px]"
          width={400}
          height={400}
          src="/atrium/animation/pie.riv"
        />
      </div>
    </Card>
  );
}

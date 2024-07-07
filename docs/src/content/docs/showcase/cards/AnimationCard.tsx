/* @jsxImportSource vue */

import { Animation } from "@components/src/vue/Animation";
import { Card } from "../Card";
import pie from "./animation/pie.riv?url";

export function AnimationCard() {
  return (
    <Card>
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
          src="/atrium/pie.riv"
        />

        <Animation
          class="h-[200px] w-[200px]"
          width={400}
          height={400}
          src="/atrium/pie.riv"
        />
      </div>
    </Card>
  );
}

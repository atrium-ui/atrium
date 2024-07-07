/* @jsxImportSource vue */

import { defineComponent } from "vue";
import { ChartCard } from "./cards/ChartCard";
import { AccordionCard } from "./cards/AccordionCard";
import { SliderCard } from "./cards/SliderCard";
import { SettingsCard } from "./cards/SettingsCard";
import { LoginCard } from "./cards/LoginCard";
import { PropertiesCard } from "./cards/PropertiesCard";
import { AnimationCard } from "./cards/AnimationCard";

export const Showcase = defineComponent(() => {
  return () => (
    <div class="shoawcase p-8 pt-12">
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="flex flex-col gap-4 -translate-y-5">
          <ChartCard />
          <PropertiesCard />
        </div>

        <div class="flex flex-col gap-4 translate-y-5">
          <SliderCard />
          <LoginCard />
        </div>

        <div class="flex flex-col gap-4">
          <AccordionCard />
          <SettingsCard />
          {/* <AnimationCard /> */}
        </div>
      </div>

      <a-portal>
        <a-toast-feed class="fixed right-12 bottom-12" />
      </a-portal>
    </div>
  );
});

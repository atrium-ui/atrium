/* @jsxImportSource vue */

import { defineComponent } from "vue";
import { ChartCard } from "./cards/ChartCard";
import { AccordionCard } from "./cards/AccordionCard";
import { SliderCard } from "./cards/SliderCard";
import { SettingsCard } from "./cards/SettingsCard";
import { LoginCard } from "./cards/LoginCard";
import { PropertiesCard } from "./cards/PropertiesCard";
import { AnimationCard } from "./cards/AnimationCard";
import { LightboxCard } from "./cards/LightboxCard";
import { FilterCard } from "./cards/FilterCard";

export const Showcase = defineComponent(() => {
  return () => (
    <>
      <div class="shoawcase pt-12 lg:p-8">
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="-translate-y-5 flex flex-col gap-4">
            <ChartCard />
            <PropertiesCard />
            <FilterCard />
          </div>

          <div class="flex translate-y-5 flex-col gap-4">
            <SliderCard />
            <LoginCard />
          </div>

          <div class="flex flex-col gap-4">
            <AccordionCard />
            <SettingsCard />
            <LightboxCard />
          </div>
        </div>

        <a-portal>
          <a-toast-feed class="fixed right-12 bottom-12" />
        </a-portal>
      </div>
    </>
  );
});

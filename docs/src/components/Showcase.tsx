/* @jsxImportSource vue */

import { sentence, lorem } from "txtgen";
import { defineComponent } from "vue";
import { Checkbox } from "@sv/components/src/vue/Checkbox";
import { Accordion, AccordionItem } from "@sv/components/src/vue/Accordion";
import { Input } from "@sv/components/src/vue/Input";
import { Combobox } from "@sv/components/src/vue/Combobox";
import { Button } from "@sv/components/src/vue/Button";
import { Icon } from "@sv/components/src/vue/Icon";
import { Popover } from "@sv/components/src/vue/Popover";
import { Dialog } from "@sv/components/src/vue/Dialog";

export const Showcase = defineComponent(() => {
  const data = new Array(10).fill(1).map((_, i) => {
    return {
      type: sentence().split(" ")[0],
      highlight: Math.random() > 0.5,
      title: sentence(),
    };
  });

  return () => (
    <div class="relative">
      <div class="pointer-events-none absolute bottom-0 left-0 h-[150px] w-full bg-[linear-gradient(0deg,var(--sl-color-black),transparent)]" />

      <div class="rounded-md border border-zinc-950 border-b-0 p-8">
        <div class="grid grid-cols-[1fr_400px] gap-10 pb-10">
          <div>
            <div class="flex gap-4 pb-3">
              <Combobox value="Filter">
                <Combobox.Item value="Item 1" />
                <Combobox.Item value="Item 2" />
                <Combobox.Item value="Item 3" />
              </Combobox>
              <Input class="w-full" placeholder="Search..." />
              <Dialog label="Submit">This doesn't actually do anything.</Dialog>
            </div>
            <div class="flex justify-end">
              <Checkbox id="highlights">Highlights</Checkbox>
            </div>
          </div>
          <div class="flex items-start justify-end">
            <Popover>
              {{
                input: () => (
                  <Button slot="input" variant="outline" class="rounded-[100%] p-3">
                    <Icon name="atrium" />
                  </Button>
                ),
                default: () => (
                  <div class="flex flex-col gap-1">
                    <Button variant="ghost" class="w-[200px] gap-4">
                      <Icon name="arrow-right" />
                      <span>Profile</span>
                    </Button>
                    <Button variant="ghost" class="w-[200px] gap-4">
                      <Icon name="close" />
                      <span>Settings</span>
                    </Button>
                    <hr class="my-1 h-[1px] w-full bg-zinc-700" />
                    <div class="px-2">
                      <Checkbox id="darkmode">
                        <span class="text-base">Darkmode</span>
                      </Checkbox>
                    </div>
                  </div>
                ),
              }}
            </Popover>
          </div>
        </div>

        <div class="grid max-h-[500px] grid-cols-[1fr_400px] gap-10 overflow-hidden">
          <div class="grid grid-cols-3 gap-4">
            {data.map((data, i) => {
              return <div key={i} class="h-[300px] w-full rounded bg-zinc-800" />;
            })}
          </div>
          <div>
            <Accordion>
              <AccordionItem title={sentence().split(" ").slice(0, 6).join(" ")}>
                {lorem(10, 40)}
              </AccordionItem>
              <AccordionItem title={sentence().split(" ").slice(0, 6).join(" ")}>
                {lorem(10, 40)}
              </AccordionItem>
              <AccordionItem title={sentence().split(" ").slice(0, 6).join(" ")}>
                {lorem(10, 40)}
              </AccordionItem>
              <AccordionItem title={sentence().split(" ").slice(0, 6).join(" ")}>
                {lorem(10, 40)}
              </AccordionItem>
              <AccordionItem title={sentence().split(" ").slice(0, 6).join(" ")}>
                {lorem(10, 40)}
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
});

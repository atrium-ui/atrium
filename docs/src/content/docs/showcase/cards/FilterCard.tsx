/* @jsxImportSource vue */

import { Combobox } from "@components/src/vue/Combobox";
import { Card } from "../Card";

export function FilterCard() {
  return (
    <Card class="p-3">
      <div class="flex flex-col space-y-1.5 pb-8">
        <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
          Filter
        </h3>
        <p class="text-muted-foreground text-sm">Incididunt voluptate dolore sit.</p>
      </div>

      <div>
        <Combobox
          name="combobox"
          placeholder="Select"
          options={[
            { label: "Item 1", value: "item-1" },
            { label: "Item 2", value: "item-2" },
            { label: "Item 3", value: "item-3" },
          ]}
        />
      </div>

      <div class="grid grid-cols-2 gap-2 pt-4">
        <div class="h-full min-h-[100px] w-full rounded-xs bg-gray-500" />
        <div class="h-full min-h-[100px] w-full rounded-xs bg-gray-500" />
        <div class="h-full min-h-[100px] w-full rounded-xs bg-gray-500" />
        <div class="h-full min-h-[100px] w-full rounded-xs bg-gray-500" />
      </div>
    </Card>
  );
}

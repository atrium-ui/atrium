/* @jsxImportSource vue */

import { Checkbox } from "@components/src/vue/Checkbox";
import { Card } from "../Card";
import { Select, SelectItem } from "@components/src/vue/Select";
import { Dialog } from "@components/src/vue/Dialog";

export function PropertiesCard() {
  return (
    <Card class="p-0">
      <div class="px-6 pt-6">
        <div class="flex flex-col space-y-1.5 pb-8">
          <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
            Customizable Product
          </h3>
          <p class="text-muted-foreground text-sm">
            Adjust the settings to your liking and add this product to your cart.
          </p>
        </div>
      </div>

      <div class="grid px-6">
        <div>
          <div class="grid gap-4">
            <div>
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="range"
              >
                Quantity
              </label>
              <a-range class="w-full" value="0.33" />
            </div>
          </div>

          <div class="grid gap-4 pb-4">
            <div>
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="option"
              >
                Option
              </label>
              <Select class="relative z-20" name="select" placeholder="Select">
                <SelectItem value="Item 1" />
                <SelectItem value="Item 2" />
                <SelectItem value="Item 3" />
              </Select>
            </div>
          </div>

          <div class="grid gap-4">
            <Checkbox name="extra">Add extra feature</Checkbox>
          </div>
        </div>
      </div>

      <div class="mt-6 border-zinc-950 border-t p-6" data-id="34">
        <div class="flex justify-end gap-2" data-id="35">
          <Dialog label="Add to Cart">Really add to Cart?</Dialog>
        </div>
      </div>
    </Card>
  );
}

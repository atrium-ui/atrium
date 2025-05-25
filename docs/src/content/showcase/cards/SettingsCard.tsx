/* @jsxImportSource vue */

import { Checkbox } from "@components/src/vue/Checkbox";
import { Button } from "@components/src/vue/Button";
import { Icon } from "@components/src/vue/Icon";
import { Popover } from "@components/src/vue/Popover";
import { Card } from "../Card";
import { Switch } from "@components/src/vue/Switch";
import { Dialog } from "@components/src/vue/Dialog";
import "@sv/elements/toggle";

export function SettingsCard() {
  return (
    <Card class="p-0">
      <div class="grid grid-cols-[1fr_auto] items-start px-6 pt-6">
        <div class="flex flex-col space-y-1.5 pb-8">
          <h3 class="whitespace-nowrap font-semibold text-2xl leading-none tracking-tight">
            Settings
          </h3>
          <p class="text-muted-foreground text-sm">Customize your experience</p>
        </div>

        <Popover>
          {{
            input: () => (
              <Button slot="trigger" variant="outline" class="rounded-[100%] p-3 text-xl">
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
                  <Checkbox name="darkmode">
                    <span class="text-base">Darkmode</span>
                  </Checkbox>
                </div>
              </div>
            ),
          }}
        </Popover>
      </div>

      <div class="grid gap-6 px-6">
        <div>
          <h3 class="font-medium text-lg">General</h3>
          <div class="mt-4 grid gap-4">
            <div class="flex items-center justify-between">
              <label
                class="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="dark-mode"
              >
                Dark Mode
              </label>
              <Switch name="dark-mode" />
            </div>
            <div class="flex items-center justify-between">
              <label
                class="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="notifications"
              >
                Notifications
              </label>
              <Switch name="notifications" />
            </div>
            <div class="flex items-center justify-between">
              <label
                class="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="password-manager"
              >
                Password Manager
              </label>
              <Switch name="notifications" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 border-t p-6 dark:border-zinc-950" data-id="34">
        <div class="flex justify-end gap-2" data-id="35">
          <Button variant="outline">Cancel</Button>
          <Dialog label="Save Changes">Are you sure you want to save changes?</Dialog>
        </div>
      </div>
    </Card>
  );
}

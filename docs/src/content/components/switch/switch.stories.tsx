/* @jsxImportSource vue */
import type { Story } from "@sv/astro-stories";
import Switch from "@components/src/vue/Switch.vue";
import { ref } from "vue";

export default {
  tags: ["public"],
} satisfies Story;

export const Default = {
  render: () => {
    const value = ref(false);
    return (
      <div class="flex min-h-[100px] items-center justify-center gap-4">
        <Switch
          value={value.value}
          onChange={(e) => {
            value.value = (e.target as HTMLInputElement).checked;
          }}
        />
        <span class="text-sm">{value.value ? "On" : "Off"}</span>
      </div>
    );
  },
};

export const Checked = {
  render: () => {
    return (
      <div class="flex min-h-[100px] items-center justify-center">
        <Switch value={true} />
      </div>
    );
  },
};

export const LandingPage = {
  render: () => {
    const marketingEmails = ref(true);
    const pushAlerts = ref(false);
    const weeklyReports = ref(true);

    return (
      <div class="flex h-full items-start justify-center p-3">
        <div class="w-full max-w-2xl overflow-hidden border border-zinc-200 bg-white">
          <div class="flex flex-col gap-px bg-zinc-200">
            <div class="flex items-center justify-between gap-2 bg-white px-4 py-2">
              <div class="w-full min-w-0">
                <div class="font-medium text-sm text-zinc-900">Marketing emails</div>
                <div class="mt-1 overflow-hidden whitespace-nowrap text-sm text-zinc-600">
                  Announcements and product news.
                </div>
              </div>
              <Switch
                value={marketingEmails.value}
                onChange={(e) => {
                  marketingEmails.value = (e.target as HTMLInputElement).checked;
                }}
              />
            </div>

            <div class="flex items-center justify-between gap-2 bg-white px-4 py-2">
              <div class="w-full min-w-0">
                <div class="font-medium text-sm text-zinc-900">Push alerts</div>
                <div class="mt-1 overflow-hidden whitespace-nowrap text-sm text-zinc-600">
                  Mentions and activity alerts.
                </div>
              </div>
              <Switch
                value={pushAlerts.value}
                onChange={(e) => {
                  pushAlerts.value = (e.target as HTMLInputElement).checked;
                }}
              />
            </div>

            <div class="flex items-center justify-between gap-2 bg-white px-4 py-2">
              <div class="w-full min-w-0">
                <div class="font-medium text-sm text-zinc-900">Weekly reports</div>
                <div class="mt-1 overflow-hidden whitespace-nowrap text-sm text-zinc-600">
                  A weekly team summary.
                </div>
              </div>
              <Switch
                value={weeklyReports.value}
                onChange={(e) => {
                  weeklyReports.value = (e.target as HTMLInputElement).checked;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

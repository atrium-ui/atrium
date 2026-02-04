/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import "@sv/elements/tabs";
import "@sv/elements/track";

export default {
  tags: ["public"],
  args: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex min-h-[400px] max-w-full items-center justify-center p-4">
        <a-tabs class="w-full max-w-2xl">
          <a-tabs-list
            class="flex gap-1 border-zinc-200 border-b bg-white"
            label="Example tabs"
          >
            <a-tabs-tab class="cursor-pointer whitespace-nowrap border-transparent border-b-2 px-6 py-3 text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 [&[selected]]:border-blue-600 [&[selected]]:text-blue-600">
              Overview
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer whitespace-nowrap border-transparent border-b-2 px-6 py-3 text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 [&[selected]]:border-blue-600 [&[selected]]:text-blue-600">
              Details
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer whitespace-nowrap border-transparent border-b-2 px-6 py-3 text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 [&[selected]]:border-blue-600 [&[selected]]:text-blue-600">
              Settings
            </a-tabs-tab>
          </a-tabs-list>

          <a-tabs-panel class="block">
            <div class="p-6">
              <h3 class="mb-3 font-semibold text-lg text-zinc-900">Overview</h3>
              <p class="text-zinc-600">
                This is the overview panel. It displays general information about the
                content.
              </p>
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="p-6">
              <h3 class="mb-3 font-semibold text-lg text-zinc-900">Details</h3>
              <p class="text-zinc-600">
                This panel contains detailed information with more specific content.
              </p>
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="p-6">
              <h3 class="mb-3 font-semibold text-lg text-zinc-900">Settings</h3>
              <p class="text-zinc-600">
                Configure your preferences and options in this settings panel.
              </p>
            </div>
          </a-tabs-panel>
        </a-tabs>
      </div>
    );
  },
};

export const ManyTabs = {
  render: () => {
    return (
      <div class="flex min-h-[400px] max-w-full items-center justify-center p-4">
        <a-tabs class="w-full max-w-2xl">
          <a-tabs-list
            class="flex gap-1 overflow-x-auto border-zinc-200 border-b bg-white"
            label="Many tabs example"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <a-tabs-tab
                key={num}
                class="cursor-pointer whitespace-nowrap border-transparent border-b-2 px-6 py-3 text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 [&[selected]]:border-blue-600 [&[selected]]:text-blue-600"
              >
                Tab {num}
              </a-tabs-tab>
            ))}
          </a-tabs-list>

          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <a-tabs-panel key={num} class="block">
              <div class="p-6">
                <p class="text-zinc-600">Content for tab {num}</p>
              </div>
            </a-tabs-panel>
          ))}
        </a-tabs>
      </div>
    );
  },
};

/* @jsxImportSource vue */
import type { Story } from "@atrium-ui/astro-stories";
import "@atrium-ui/elements/tabs";
import "@atrium-ui/elements/track";

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
            class="inline-flex max-w-full gap-1 rounded-xl bg-zinc-100 p-1"
            label="Example tabs"
          >
            <a-tabs-tab class="cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-sm text-zinc-500 outline-hidden transition-colors hover:text-zinc-900 [&[selected]]:border-zinc-200 [&[selected]]:bg-white [&[selected]]:text-zinc-900 [&[selected]]:shadow-sm">
              Overview
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-sm text-zinc-500 outline-hidden transition-colors hover:text-zinc-900 [&[selected]]:border-zinc-200 [&[selected]]:bg-white [&[selected]]:text-zinc-900 [&[selected]]:shadow-sm">
              Details
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-sm text-zinc-500 outline-hidden transition-colors hover:text-zinc-900 [&[selected]]:border-zinc-200 [&[selected]]:bg-white [&[selected]]:text-zinc-900 [&[selected]]:shadow-sm">
              Settings
            </a-tabs-tab>
          </a-tabs-list>

          <a-tabs-panel class="block">
            <div class="p-2 pt-4">
              <h3 class="mb-3 font-semibold text-lg text-zinc-900">Overview</h3>
              <p class="text-zinc-600">
                This is the overview panel. It displays general information about the
                content.
              </p>
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="p-2 pt-4">
              <h3 class="mb-3 font-semibold text-lg text-zinc-900">Details</h3>
              <p class="text-zinc-600">
                This panel contains detailed information with more specific content.
              </p>
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="p-2 pt-4">
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
            class="flex max-w-full gap-1 overflow-hidden rounded-xl bg-zinc-100 p-1 [--tabs-arrow-fade:var(--color-zinc-100)]"
            label="Many tabs example"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <a-tabs-tab
                key={num}
                class="cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-sm text-zinc-500 outline-hidden transition-colors hover:text-zinc-900 [&[selected]]:border-zinc-200 [&[selected]]:bg-white [&[selected]]:text-zinc-900 [&[selected]]:shadow-sm"
              >
                Tab number {num}
              </a-tabs-tab>
            ))}
          </a-tabs-list>

          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <a-tabs-panel key={num} class="block">
              <div class="p-2 pt-4">
                <p class="text-zinc-600">Content for tab {num}</p>
              </div>
            </a-tabs-panel>
          ))}
        </a-tabs>
      </div>
    );
  },
};

export const LandingPage = {
  render: () => {
    return (
      <div class="h-full p-4">
        <a-tabs class="block h-full w-full border border-zinc-200 bg-white">
          <a-tabs-list
            class="border-zinc-200 border-b bg-white"
            label="Landing page tabs"
          >
            <a-tabs-tab class="cursor-pointer border-zinc-200 border-r px-4 py-3 text-xs text-zinc-500 uppercase tracking-[0.16em] transition-colors hover:bg-zinc-50 [&[selected]]:bg-zinc-900 [&[selected]]:text-white">
              Specs
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer border-zinc-200 border-r px-4 py-3 text-xs text-zinc-500 uppercase tracking-[0.16em] transition-colors hover:bg-zinc-50 [&[selected]]:bg-zinc-900 [&[selected]]:text-white">
              Notes
            </a-tabs-tab>
            <a-tabs-tab class="cursor-pointer px-4 py-3 text-xs text-zinc-500 uppercase tracking-[0.16em] transition-colors hover:bg-zinc-50 [&[selected]]:bg-zinc-900 [&[selected]]:text-white">
              Files
            </a-tabs-tab>
          </a-tabs-list>

          <a-tabs-panel class="block">
            <div class="grid gap-3 p-4 text-sm text-zinc-600">
              <div class="flex justify-between border border-zinc-200 px-3 py-2">
                <span>Variant</span>
                <span>Compact</span>
              </div>
              <div class="flex justify-between border border-zinc-200 px-3 py-2">
                <span>Theme</span>
                <span>Neutral</span>
              </div>
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="p-4 text-sm text-zinc-600">
              Focused panels keep dense content grouped without leaving the page.
            </div>
          </a-tabs-panel>

          <a-tabs-panel class="block">
            <div class="grid gap-2 p-4">
              <div class="h-8 border border-zinc-200 bg-zinc-50" />
              <div class="h-8 border border-zinc-200 bg-zinc-50" />
            </div>
          </a-tabs-panel>
        </a-tabs>
      </div>
    );
  },
};

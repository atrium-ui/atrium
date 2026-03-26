/* @jsxImportSource vue */
import type { Story } from "@sv/astro-stories";
import ToolTip from "@components/src/vue/Tooltip.vue";
import Button from "@components/src/vue/Button.vue";
import Popover from "@components/src/vue/Popover.vue";

export default {
  tags: ["public"],
  args: {
    count: 5,
  },
  argTypes: {
    count: {
      description: "Number of slides",
    },
  },
} satisfies Story;

export const Default = {
  render: (args) => {
    return (
      <div class="flex min-h-[300px] max-w-full items-center justify-center">
        <Popover label="Click">
          <div class="p-3">
            <p>Some Content</p>
            <Button>Button</Button>
          </div>
        </Popover>
      </div>
    );
  },
};

export const Tooltip = {
  render: (args) => {
    return (
      <div class="flex min-h-[300px] max-w-full items-center justify-center">
        <ToolTip label="Hover">
          <div class="p-3">
            <p>Some Content</p>
          </div>
        </ToolTip>
      </div>
    );
  },
};

export const LandingPage = {
  render: () => {
    return (
      <div class="h-full p-4">
        <div class="grid h-full content-start gap-4 border border-zinc-200 bg-white p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="mb-1 text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                Popover
              </div>
              <div class="text-sm text-zinc-700">
                Attach tools and context to nearby controls.
              </div>
            </div>

            <Popover label="Actions">
              <div class="grid min-w-[12rem] gap-2 p-3">
                <button
                  type="button"
                  class="border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700"
                >
                  Duplicate block
                </button>
                <button
                  type="button"
                  class="border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700"
                >
                  Assign owner
                </button>
                <button
                  type="button"
                  class="border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700"
                >
                  Move to draft
                </button>
              </div>
            </Popover>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="h-16 border border-zinc-200 bg-zinc-50" />
            <div class="h-16 border border-zinc-200 bg-zinc-50" />
          </div>
        </div>
      </div>
    );
  },
};

/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Button } from "@components/src/vue";
import { Toasts, toast } from "@components/src/vue";
import { paragraph } from "txtgen";

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex min-h-[200px] max-w-full items-center justify-center">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              message: paragraph(1),
              time: Math.random() * 10000,
            });
          }}
        >
          Show Toast
        </Button>

        <Toasts />
      </div>
    );
  },
};

export const LandingPage = {
  render: () => {
    return (
      <div class="flex min-h-[220px] items-end justify-start p-4">
        <div class="w-full max-w-xs border border-zinc-200 bg-white p-3">
          <div class="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-zinc-400">
            <span>Toast</span>
            <button
              type="button"
              class="border border-zinc-200 px-2 py-1 text-zinc-600"
              onClick={() => {
                toast({
                  message: paragraph(1),
                  time: 4000,
                });
              }}
            >
              Trigger
            </button>
          </div>

          <p class="text-sm text-zinc-600">
            Trigger a lightweight notification stack from inside the tile.
          </p>
        </div>

        <Toasts />
      </div>
    );
  },
};

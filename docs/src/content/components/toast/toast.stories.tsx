/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Button } from "@components/src/vue";
import { Toasts, toast } from "@components/src/vue";
import { paragraph } from "txtgen";

export default {
  tags: ["public"],
  args: {
  },
  argTypes: {
  },
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

/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Tooltip as ToolTip } from "@components/src/vue";
import { Button } from "@components/src/vue";
import { Popover } from "@components/src/vue";

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

/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Tooltip as ToolTip } from "@components/src/vue/Tooltip";

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
  render: (args) => {
    return (
      <div class="flex min-h-[200px] max-w-full items-center justify-center">
        <ToolTip label="Hover">
          <div class="p-3">
            <p>Some Content</p>
          </div>
        </ToolTip>
      </div>
    );
  },
} satisfies Story;

export const Default = {};

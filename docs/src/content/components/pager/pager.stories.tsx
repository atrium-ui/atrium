/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Pager } from "@components/src/vue";

export default {
  tags: ["public"],
  args: {
    count: 10,
  },
  argTypes: {
    count: {
      description: "Total number of pages",
    },
  },
} satisfies Story;

export const Default = {
  render: (args) => (
    <div class="flex min-h-[200px] items-center justify-center p-8">
      <Pager count={args.count} page={5} />
    </div>
  ),
};

export const ManyPages = {
  render: () => (
    <div class="flex min-h-[200px] items-center justify-center p-8">
      <Pager count={50} page={1} />
    </div>
  ),
};

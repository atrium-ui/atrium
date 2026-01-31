/* @jsxImportSource vue */
import { BackToTop } from "@components/src/vue";
import type { Story } from "../../../components/stories/stories.js";

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
      <div>
        <div class="h-[400px]"></div>

        <BackToTop visible />
      </div>
    );
  },
} satisfies Story;

export const Default = {};

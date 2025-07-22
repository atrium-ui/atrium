/* @jsxImportSource vue */

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
        <span>tba</span>
      </div>
    );
  },
} satisfies Story;

export const Default = {};

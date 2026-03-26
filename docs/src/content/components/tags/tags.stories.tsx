/* @jsxImportSource vue */

import type { Story } from "@sv/astro-stories";

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
    return <div>tba</div>;
  },
} satisfies Story;

export const Default = {};

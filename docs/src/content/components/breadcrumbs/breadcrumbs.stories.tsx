/* @jsxImportSource vue */

import type { Story } from "../../../components/stories/stories.js";
import { Breadcrumbs } from "@components/src/vue";

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
        <Breadcrumbs>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <span>Contact</span>
        </Breadcrumbs>
      </div>
    );
  },
} satisfies Story;

export const Default = {};

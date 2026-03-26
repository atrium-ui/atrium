/* @jsxImportSource vue */

import type { Story } from "@sv/astro-stories";
import Breadcrumbs from "@components/src/vue/Breadcrumbs.vue";

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

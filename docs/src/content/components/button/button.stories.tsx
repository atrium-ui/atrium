/* @jsxImportSource vue */

import type { Story } from "../../../components/stories/stories.js";
import { Icon } from "@components/src/vue/Icon";
import { Button } from "@components/src/vue/Button";

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
} satisfies Story;

export const Default = {
  render: () => {
    return (
      <div class="flex justify-center py-10 gap-10">
        <Button>Button</Button>
        <Button disabled>Disabled</Button>
        <Button>
          <span>with icon</span>
          <Icon name="check" />
        </Button>
      </div>
    );
  },
};

export const Ghost = {
  render: () => {
    return (
      <div class="flex justify-center py-10 gap-10">
        <Button variant="ghost">Button</Button>
        <Button variant="ghost" disabled>
          Disabled
        </Button>
        <Button variant="ghost">
          <span>with icon</span>
          <Icon name="check" />
        </Button>
      </div>
    );
  },
};

export const Outline = {
  render: () => {
    return (
      <div class="flex justify-center py-10 gap-10">
        <Button variant="outline">Button</Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
        <Button variant="outline">
          <span>with icon</span>
          <Icon name="check" />
        </Button>
      </div>
    );
  },
};

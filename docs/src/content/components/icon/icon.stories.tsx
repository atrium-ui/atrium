/* @jsxImportSource vue */

import { Icon } from "@components/src/vue";
import type { Story } from "../../../components/stories/stories.js";
import * as IconSet from "@sv/icons";

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
} satisfies Story;

export const Default = {
  render: () => (
    <div class="flex max-w-full flex-wrap gap-6 p-6" style="font-size: 2rem;">
      {IconSet.icons.map((icon) => (
        <Icon name={icon} />
      ))}
    </div>
  ),
};

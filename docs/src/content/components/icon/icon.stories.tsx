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
    <div class="flex gap-6 flex-wrap p-6 max-w-full" style="font-size: 2rem;">
      {IconSet.icons.map(icon => <Icon name={icon} />)}
    </div>
  ),
};

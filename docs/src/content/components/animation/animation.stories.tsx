/* @jsxImportSource vue */
import { Animation } from "@components/src/vue";
import type { Story } from "../../../components/stories/stories.js";

const base = import.meta.env.BASE_URL;

export default {
  tags: ["public"],
  args: {},
  argTypes: {},
};

export const Default: Story = {
  render: (args) => {
    return <Animation width={400} height={400} src={`${base}animation/example.riv`} />;
  },
};

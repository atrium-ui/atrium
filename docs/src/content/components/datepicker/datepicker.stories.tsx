/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Datepicker } from "@components/src/vue/Datepicker";

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
} satisfies Story;

export const Default = {
  render: (args) => {
    return (
      <div class="flex pt-[50px] pb-[300px] max-w-full items-center justify-center">
        <Datepicker
          onChange={(ev) => {
            console.info(ev.detail.date);
          }}
        />
      </div>
    );
  },
};

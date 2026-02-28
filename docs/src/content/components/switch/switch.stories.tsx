/* @jsxImportSource vue */
import type { Story } from "../../../components/stories/stories.js";
import { Switch } from "@components/src/vue";
import { ref } from "vue";

export default {
  tags: ["public"],
} satisfies Story;

export const Default = {
  render: () => {
    const value = ref(false);
    return (
      <div class="flex min-h-[100px] items-center justify-center gap-4">
        <Switch value={value.value} onChange={(e) => (value.value = (e.target as HTMLInputElement).checked)} />
        <span class="text-sm">{value.value ? "On" : "Off"}</span>
      </div>
    );
  },
};

export const Checked = {
  render: () => {
    return (
      <div class="flex min-h-[100px] items-center justify-center">
        <Switch value={true} />
      </div>
    );
  },
};

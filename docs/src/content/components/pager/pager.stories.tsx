/* @jsxImportSource vue */
import type { Story } from "@sv/astro-stories";
import Pager from "@components/src/vue/Pager.vue";

export default {
  tags: ["public"],
  args: {
    count: 10,
  },
  argTypes: {
    count: {
      description: "Total number of pages",
    },
  },
} satisfies Story;

export const Default = {
  render: (args) => (
    <div class="flex min-h-[200px] items-center justify-center p-8">
      <Pager count={args.count} page={5} />
    </div>
  ),
};

export const ManyPages = {
  render: () => (
    <div class="flex min-h-[200px] items-center justify-center p-8">
      <Pager count={50} page={1} />
    </div>
  ),
};

export const LandingPage = {
  render: () => (
    <div class="flex h-full items-center justify-center p-3">
      <div class="flex justify-center">
        <Pager count={12} page={4} />
      </div>
    </div>
  ),
};

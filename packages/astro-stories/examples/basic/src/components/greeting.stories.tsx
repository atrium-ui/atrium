import type { Story } from "@sv/astro-stories";

export default {
  args: {
    name: "world",
  },
  argTypes: {
    name: { control: { type: "text" } },
  },
} satisfies Story;

export const Default = {
  render: (args: { name: string }) => <p>Hello, {args.name}!</p>,
};

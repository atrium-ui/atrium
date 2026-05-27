import type { Story } from "@sv/astro-stories";

export default {
  tags: ["public"],
  args: {
    label: "Click me",
    disabled: false,
  },
  argTypes: {
    label: { control: { type: "text" } },
    disabled: { control: { type: "boolean" } },
  },
} satisfies Story;

export const Default = {
  render: (args: { label: string; disabled: boolean }) => (
    <button type="button" disabled={args.disabled}>
      {args.label}
    </button>
  ),
};

export const Primary = {
  render: (args: { label: string; disabled: boolean }) => (
    <button
      type="button"
      disabled={args.disabled}
      style={{ background: "#664aa1", color: "white", padding: "8px 16px" }}
    >
      {args.label}
    </button>
  ),
};

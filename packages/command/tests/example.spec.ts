import { describe, expect, it } from "vitest";

const NODE_NAME = "a-command";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Command } = await import("../dist/command.js");
    expect(Command).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Command()).toBeInstanceOf(Command);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Command);
  });
});

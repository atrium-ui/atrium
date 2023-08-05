import { describe, expect, it } from "vitest";

const NODE_NAME = "a-palatte";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Expandable } = await import("../dist/palatte.mjs");
    expect(Expandable).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Expandable()).toBeInstanceOf(Expandable);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Expandable);
  });
});

import { describe, expect, it } from "vitest";

const NODE_NAME = "sv-example";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Collapsable } = await import("../dist/example.mjs");
    expect(Collapsable).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Collapsable()).toBeInstanceOf(Collapsable);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Collapsable);
  });
});

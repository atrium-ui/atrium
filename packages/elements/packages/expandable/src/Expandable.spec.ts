import { describe, expect, it } from "bun:test";

const NODE_NAME = "a-expandable";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Expandable } = await import("@sv/elements/expandable");
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

// TODO: test case with 100% width child element

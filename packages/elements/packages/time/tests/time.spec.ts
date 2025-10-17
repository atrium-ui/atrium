import { describe, expect, it } from "bun:test";

const NODE_NAME = "a-time";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Time } = await import("../dist/index.js");
    expect(Time).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Time()).toBeInstanceOf(Time);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Time);
  });
});

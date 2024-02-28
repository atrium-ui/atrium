import { describe, expect, it } from "bun:test";

const NODE_NAME = "a-track";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Track } = await import("@sv/elements/track");
    expect(Track).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Track()).toBeInstanceOf(Track);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Track);
  });
});

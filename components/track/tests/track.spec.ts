import { describe, expect, it } from "vitest";

const NODE_NAME = "sv-track";

describe(NODE_NAME, () => {
  it("import element", async () => {
    const { Track } = await import("../dist/track.mjs");
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

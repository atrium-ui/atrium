import { test, expect } from "bun:test";

const NODE_NAME = "a-track";

test("import track element", async () => {
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

test("check default traits", async () => {
  const { Track } = await import("@sv/elements/track");

  const track = new Track();
  expect(track.findTrait("snap")).toBeDefined();
  expect(track.findTrait("pointer")).toBeDefined();
});

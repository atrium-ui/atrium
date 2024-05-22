import { test, expect } from "bun:test";

const NODE_NAME = "a-popover";

test("import element", async () => {
  const { Popover } = await import("@sv/elements/popover");
  expect(Popover).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Popover()).toBeInstanceOf(Popover);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Popover);
});

test("initial state", async () => {
  const { Popover } = await import("@sv/elements/popover");
  const ele = new Popover();

  expect(ele.opened).toBe(false);
});

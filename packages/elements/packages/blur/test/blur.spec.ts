import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-blur";

test("import a-blur element", async () => {
  const { Blur } = await import("@sv/elements/blur");
  expect(Blur).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-blur element", async () => {
  const { Blur } = await import("@sv/elements/blur");

  // is constructable
  expect(new Blur()).toBeInstanceOf(Blur);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Blur);
});

import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-list";

test("import a-list element", async () => {
  const { List } = await import("@sv/elements/list");
  expect(List).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-list element", async () => {
  const { List } = await import("@sv/elements/list");

  // is constructable
  expect(new List()).toBeInstanceOf(List);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(List);
});

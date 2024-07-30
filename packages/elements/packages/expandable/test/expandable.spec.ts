import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-expandable";

test("import a-expandable element", async () => {
  const { Expandable } = await import("@sv/elements/expandable");
  expect(Expandable).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-expandable element", async () => {
  const { Expandable } = await import("@sv/elements/expandable");

  // is constructable
  expect(new Expandable()).toBeInstanceOf(Expandable);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Expandable);
});

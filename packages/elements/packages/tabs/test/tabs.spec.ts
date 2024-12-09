import { test, expect } from "bun:test";

const NODE_NAME = "a-tabs";

test("import element", async () => {
  const { Tabs } = await import("@sv/elements/tabs");
  expect(Tabs).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Tabs()).toBeInstanceOf(Tabs);

  // upgrades when added to the DOM
  const ele = document.createElement("div");
  ele.innerHTML = `<${NODE_NAME} />`;
  expect(ele.children[0]).toBeInstanceOf(Tabs);
});

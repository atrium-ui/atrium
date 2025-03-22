import { test, expect, describe } from "bun:test";
import { SelectEvent } from "../src/Select";

const NODE_NAME = "a-list";

test("import a-list element", async () => {
  const { Select } = await import("@sv/elements/select");
  expect(Select).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-list element", async () => {
  const { Select } = await import("@sv/elements/select");

  // is constructable
  expect(new Select()).toBeInstanceOf(Select);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Select);
});

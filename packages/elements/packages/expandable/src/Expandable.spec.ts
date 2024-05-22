import { test, expect } from "bun:test";

const NODE_NAME = "a-expandable";

test("import element", async () => {
  const { Expandable } = await import("@svp/elements/expandable");
  expect(Expandable).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Expandable()).toBeInstanceOf(Expandable);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Expandable);
});

test("change event", async () => {
  const { Expandable } = await import("@svp/elements/expandable");

  const ele = new Expandable();

  let changed = false;
  ele.addEventListener("change", () => {
    changed = true;
  });

  ele.opened = true;

  expect(changed).toBeFalse();

  ele.open();

  expect(changed).toBeTrue();
});

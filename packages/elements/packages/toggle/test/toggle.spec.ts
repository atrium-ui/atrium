import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-toggle";

async function newElement(options: { value?: string } = {}) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-toggle value="${options.value}">
      <button type="button" slot="trigger">Button</button>
    </a-toggle>
  `;

  document.body.append(ele);
  return ele;
}

test("import a-toggle element", async () => {
  const { ToggleElement } = await import("@sv/elements/toggle");
  expect(ToggleElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-toggle element", async () => {
  const { ToggleElement } = await import("@sv/elements/toggle");

  // is constructable
  expect(new ToggleElement()).toBeInstanceOf(ToggleElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ToggleElement);
});

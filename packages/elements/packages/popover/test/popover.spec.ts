import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-popover";

async function newElement(
  options: {
    value?: string;
  } = {},
) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-popover value="${options.value}">
      <button type="button" slot="input">Button</button>
    </a-popover>
  `;

  document.body.append(ele);
  return ele;
}

test("import a-popover element", async () => {
  const { Popover } = await import("@sv/elements/popover");
  expect(Popover).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-popover element", async () => {
  const { Popover } = await import("@sv/elements/popover");

  // is constructable
  expect(new Popover()).toBeInstanceOf(Popover);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Popover);
});

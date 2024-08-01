import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-scroll";

async function newElement(
  options: {
    value?: string;
  } = {},
) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-scroll value="${options.value}">
      <button type="button" slot="input">Button</button>
    </a-scroll>
  `;

  document.body.append(ele);
  return ele;
}

test("import a-toggle element", async () => {
  const { ScrollElement } = await import("@sv/elements/scroll");
  expect(ScrollElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-toggle element", async () => {
  const { ScrollElement } = await import("@sv/elements/scroll");

  // is constructable
  expect(new ScrollElement()).toBeInstanceOf(ScrollElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ScrollElement);
});

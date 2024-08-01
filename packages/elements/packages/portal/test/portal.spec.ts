import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-portal";

async function newElement(
  options: {
    value?: string;
  } = {},
) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-portal value="${options.value}">
      <button type="button" slot="input">Button</button>
    </a-portal>
  `;

  document.body.append(ele);
  return ele;
}

test("import a-portal element", async () => {
  const { Portal } = await import("@sv/elements/portal");
  expect(Portal).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-portal element", async () => {
  const { Portal } = await import("@sv/elements/portal");

  // is constructable
  expect(new Portal()).toBeInstanceOf(Portal);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Portal);
});

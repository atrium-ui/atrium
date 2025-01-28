import { test, expect } from "bun:test";

const NODE_NAME = "a-form-field";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("import element", async () => {
  const { FormFieldElement } = await import("@sv/elements/form");
  expect(FormFieldElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new FormFieldElement()).toBeInstanceOf(FormFieldElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(FormFieldElement);
});

import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-chart";

test("import a-chart element", async () => {
  const { ChartElement } = await import("@sv/elements/chart");
  expect(ChartElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-chart element", async () => {
  const { ChartElement } = await import("@sv/elements/chart");

  // is constructable
  expect(new ChartElement()).toBeInstanceOf(ChartElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ChartElement);
});

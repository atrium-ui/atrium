import { test, expect, describe } from "bun:test";
import { resolve } from "node:path";

const NODE_NAME = "a-chart";

test("import a-chart element", async () => {
  const { ChartElement } = await import("../dist/index.js");
  expect(ChartElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-chart element", async () => {
  const { ChartElement } = await import("../dist/index.js");

  // is constructable
  expect(new ChartElement()).toBeInstanceOf(ChartElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ChartElement);
});

test("chart load and cleanup", async () => {
  const ele = await newChartElement();
  expect(ele.paused).toBe(true);

  // file path from current file
  const dummy_data = Bun.file(resolve(import.meta.dirname, "./chart-data.json"));
  const arr = await dummy_data.arrayBuffer();
  const dataUri = `data:application/json;base64,${btoa(String.fromCharCode(...new Uint8Array(arr)))}`;
  ele.src = dataUri;

  // wait for load
  await new Promise((resolve) => {
    ele.addEventListener("load", () => {
      resolve(true);
    });
  });

  expect(ele.loaded).toBe(true);
  expect(ele.paused).toBe(false);

  ele.remove();
  expect(ele.loaded).toBe(false);
  expect(ele.paused).toBe(true);
});

async function newChartElement() {
  await import("../dist/index.js");
  const ele = document.createElement(NODE_NAME);
  document.body.appendChild(ele);
  return ele;
}

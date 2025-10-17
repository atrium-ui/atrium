import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-toast-feed";

test("import element", async () => {
  const { ToastFeed } = await import("../dist/index.js");
  expect(ToastFeed).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct element", async () => {
  const { ToastFeed } = await import("../dist/index.js");

  // is constructable
  expect(new ToastFeed()).toBeInstanceOf(ToastFeed);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ToastFeed);
});

async function newElement() {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-toast-feed></a-toast-feed>
  `;

  document.body.append(ele);
  return ele;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

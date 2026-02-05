import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-transition";

async function newElement(options: { type?: "size" | "transition" | "animation" } = {}) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-transition type="${options.type || "size"}">
      <div>Initial Content</div>
    </a-transition>
  `;

  document.body.append(ele);
  return ele;
}

test("import a-transition element", async () => {
  const { Transition } = await import("../src/index.js");
  expect(Transition).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-transition element", async () => {
  const { Transition } = await import("../src/index.js");

  // is constructable
  expect(new Transition()).toBeInstanceOf(Transition);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Transition);
});

test("animateSizes does not run before initialization", async () => {
  const { Transition } = await import("../src/index.js");

  const transition = new Transition();

  // Should return early without throwing
  await transition.animateSizes();

  expect(transition.initialised).toBe(false);

  document.body.append(transition);
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Should return early without throwing
  await transition.animateSizes();

  expect(transition.initialised).toBe(true);
});

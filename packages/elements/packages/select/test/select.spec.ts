import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-select";

async function newSelectElement(
  options: {
    value?: string;
  } = {},
) {
  const ele = document.createElement("div");

  if (options.value) {
    ele.innerHTML = `
      <a-select value="${options.value}">
        <button type="button" slot="input">Button</button>

        <a-option value="1">Option 1</a-option>
        <a-option value="2">Option 2</a-option>
        <a-option value="3">Option 3</a-option>
        <a-option value="4">Option 4</a-option>
        <a-option value="5">Option 5</a-option>
        <a-option value="6">Option 6</a-option>
      </a-select>
    `;
  } else {
    ele.innerHTML = `
      <a-select>
        <button type="button" slot="input">Button</button>

        <a-option value="1">Option 1</a-option>
        <a-option value="2">Option 2</a-option>
        <a-option value="3">Option 3</a-option>
        <a-option value="4">Option 4</a-option>
        <a-option value="5">Option 5</a-option>
        <a-option value="6">Option 6</a-option>
      </a-select>
    `;
  }

  document.body.append(ele);
  return ele;
}

test("import a-select element", async () => {
  const { Select } = await import("@sv/elements/select");
  expect(Select).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-select element", async () => {
  const { Select } = await import("@sv/elements/select");

  // is constructable
  expect(new Select()).toBeInstanceOf(Select);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Select);
});

test("a-option value", async () => {
  const ele = await newSelectElement();

  expect(ele.querySelector("a-option")?.value).toBe("1");
  ele.remove();
});

test("initial value", async () => {
  const ele = await newSelectElement();

  expect(ele.querySelector("a-select")?.value).toBeUndefined();
  ele.remove();

  const ele2 = await newSelectElement({ value: "1" });
  expect(ele.querySelector("a-select")?.value).toBe("1");
  ele2.remove();
});

test("change event on option click", async () => {
  throw new Error("Not implemented");
});

test("dropdown close on outside click", async () => {
  throw new Error("Not implemented");
});

test("no change on option select using arrow keys", async () => {
  throw new Error("Not implemented");
});

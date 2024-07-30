import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-select";

function press(ele: HTMLElement, key: string) {
  ele.dispatchEvent(new KeyboardEvent("keydown", { key }));
  ele.dispatchEvent(new KeyboardEvent("keyup", { key }));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function newSelectElement() {
  const ele = document.createElement("div");

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

  document.body.append(ele);
  ele.querySelector("a-select").onSlotChange();
  return ele;
}

async function newSelectElementWithValue(value?: string) {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-select value="${value}">
      <button type="button" slot="input">Button</button>

      <a-option value="1">Option 1</a-option>
      <a-option value="2">Option 2</a-option>
      <a-option value="3">Option 3</a-option>
      <a-option value="4">Option 4</a-option>
      <a-option value="5">Option 5</a-option>
      <a-option value="6">Option 6</a-option>
    </a-select>
  `;

  document.body.append(ele);
  ele.querySelector("a-select").onSlotChange();
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
  const root = await newSelectElement();

  expect(root.querySelector("a-option")?.value).toBe("1");
  root.remove();
});

test("initial value", async () => {
  const root = await newSelectElement();

  expect(root.querySelector("a-select")?.value).toBeUndefined();
  root.remove();

  const root2 = await newSelectElementWithValue("3");
  const select = root2.querySelector("a-select");
  expect(select?.value).toBe("3");
  select.value = "2";
  expect(select?.value).toBe("2");
  root2.remove();
});

test("open and close with events", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  let openEvent = false;
  select.addEventListener("open", () => {
    openEvent = true;
  });

  let closeEvent = false;
  select.addEventListener("close", () => {
    closeEvent = true;
  });

  // trigger clicked
  select.onClick();
  expect(select.opened).toBe(true);
  expect(openEvent).toBe(true);

  select.onClick();
  expect(select.opened).toBe(false);
  expect(closeEvent).toBe(true);
});

test("keyboard navigation", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  expect(select.value).toBe("3");

  // trigger clicked using Spacebar
  select.onClick();
  expect(select.opened).toBe(true);

  press(select, "Escape");
  expect(select.opened).toBe(false);

  // trigger clicked using Spacebar
  select.onClick();
  expect(select.opened).toBe(true);

  press(select, "ArrowDown");
  press(select, "Enter");
  expect(select.opened).toBe(false);
  expect(select.value).toBe("4");
});

test("close on tab", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  // trigger clicked
  select.onClick();
  expect(select.opened).toBe(true);

  press(select, "Tab");
  await sleep(10);
  expect(select.opened).toBe(false);
});

test("select event on option click", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  let selectEvent = false;
  select.addEventListener("select", () => {
    selectEvent = true;
  });

  // trigger clicked
  select.onClick();
  expect(select.opened).toBe(true);
  expect(select.value).toBe("3");

  // click first option
  select.onOptionsClick(root.querySelector("a-option"));
  expect(select.value).toBe("1");
  expect(selectEvent).toBe(true);
});

test("dropdown close on outside click", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  // trigger clicked
  select.onClick();
  expect(select.opened).toBe(true);

  document.body.click();
  expect(select.opened).toBe(false);
});

test("no change on option select using arrow keys", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  // trigger clicked
  select.onClick();
  expect(select.opened).toBe(true);

  let selectEvent = false;
  select.addEventListener("select", () => {
    selectEvent = true;
  });
  press(select, "ArrowDown");
  press(select, "ArrowDown");

  expect(selectEvent).toBe(false);

  // change on submit
  press(select, "Enter");
  expect(selectEvent).toBe(true);
});

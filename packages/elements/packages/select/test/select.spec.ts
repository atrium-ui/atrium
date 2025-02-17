import { test, expect, describe } from "bun:test";
import { SelectEvent } from "../src/Select";

const NODE_NAME = "a-select";

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
  open(select);
  expect(select.opened).toBe(true);
  expect(openEvent).toBe(true);

  open(select);
  expect(select.opened).toBe(false);
  expect(closeEvent).toBe(true);
});

test("keyboard navigation", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  expect(select.value).toBe("3");

  // trigger clicked using Spacebar
  open(select);
  expect(select.opened).toBe(true);

  press(select, "Escape");
  expect(select.opened).toBe(false);

  // trigger clicked using Spacebar
  open(select);
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
  open(select);
  expect(select.opened).toBe(true);

  press(select, "Tab");
  await sleep(10);
  expect(select.opened).toBe(false);
});

test("select event on option click", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  let selectEvent = false;
  select.addEventListener("change", () => {
    selectEvent = true;
  });

  // trigger clicked
  open(select);
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
  open(select);
  expect(select.opened).toBe(true);

  document.body.click();
  expect(select.opened).toBe(false);
});

test("no change on option select using arrow keys", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  // trigger clicked
  open(select);
  expect(select.opened).toBe(true);

  let selectEvent = false;
  select.addEventListener("change", () => {
    selectEvent = true;
  });
  press(select, "ArrowDown");
  press(select, "ArrowDown");

  expect(selectEvent).toBe(false);

  // change on submit
  press(select, "Enter");
  expect(selectEvent).toBe(true);
});

// input event fires when selection changes
test("input event on select", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  let inputEvent = false;
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  select.addEventListener("input", () => (inputEvent = true));

  // trigger clicked
  open(select);
  press(select, "ArrowDown");

  expect(inputEvent).toBe(true);
});

// input event fires when selection changes
test("change event", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");
  expect(select.value).toBe("3");

  let changeEvent = false;
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  select.addEventListener("change", () => (changeEvent = true));

  // trigger clicked
  open(select);

  press(select, "ArrowDown");
  expect(changeEvent).toBe(false);

  press(select, "Enter");
  expect(changeEvent).toBe(true);
  expect(select.value).toBe("4");
});

test("form data", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  const form = document.createElement("form");
  form.append(root);
  document.body.append(form);

  const formData = new FormData(form);
  expect(formData.get("test")).toBe("3");

  open(select);
  press(select, "ArrowDown");
  press(select, "Enter");

  const formData2 = new FormData(form);
  expect(formData2.get("test")).toBe("4");
});

test("validation", async () => {
  const root = await newSelectElementWithRequired();
  const select = root.querySelector("a-select");

  expect(select?.reportValidity()).toBe(false);
});

test("esc to close", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  open(select);
  expect(select.opened).toBe(true);

  press(window, "Escape");
  expect(select.opened).toBe(false);

  open(select);
  expect(select.opened).toBe(true);

  press(select, "Escape");
  expect(select.opened).toBe(false);
});

test("arrow keys navigation", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");

  expect(select.selected).toBe("3");

  // arrow keys open dropdown
  press(select, "ArrowDown");

  expect(select.opened).toBe(true);
  expect(select.selected).toBe("3");

  press(select, "ArrowUp");
  expect(select.selected).toBe("2");

  press(select, "ArrowDown");
  press(select, "ArrowDown");
  expect(select.selected).toBe("4");

  expect(select.value).toBe("3");
});

test("disabled", async () => {
  const root = await newSelectElementWithDisabled();
  const select = root.querySelector("a-select");

  open(select);
  expect(select.opened).toBe(false);

  press(select, "ArrowDown");
  expect(select.value).toBe(undefined);
  expect(select.selected).toBe(undefined);

  press(select, "Enter");
  expect(select.value).toBe(undefined);
});

test("reset", async () => {
  const root = await newSelectElementWithValue("3");
  const select = root.querySelector("a-select");
  select?.setAttribute("value", "3");
  let changeEvent = false;

  const form = document.createElement("form");
  form.append(root);
  document.body.append(form);

  open(select);
  press(select, "ArrowDown");
  press(select, "Enter");

  expect(select.value).toBeDefined();

  select.addEventListener("change", () => {
    changeEvent = true;
  });

  form.reset();

  expect(changeEvent).toBe(true);
  expect(select.value).toBe(select.getAttribute("value"));

  // test default to undefined
  select?.removeAttribute("value");
  open(select);
  press(select, "ArrowDown");
  press(select, "Enter");

  expect(select.value).toBeDefined();

  form.reset();

  expect(select.value).toBe(undefined);
});

//
/// utils

function press(ele: HTMLElement, key: string) {
  ele.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  ele.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
}

function open(select) {
  select.onClick();
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function newSelectElement() {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-select>
      <button type="button" slot="trigger">Button</button>

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
    <a-select name="test" value="${value}">
      <button type="button" slot="trigger">Button</button>

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

async function newSelectElementWithRequired() {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-select name="test" required>
      <button type="button" slot="trigger">Button</button>

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

async function newSelectElementWithDisabled() {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-select name="test" disabled>
      <button type="button" slot="trigger">Button</button>

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

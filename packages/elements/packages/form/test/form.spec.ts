import { test, expect } from "bun:test";
import type { FormFieldElement } from "../src/Form.js";

const NODE_NAME = "a-form-field";

function sleep(ms = 1) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function type(input: HTMLInputElement, txt: string) {
  input.value = txt;
  await sleep();
}

function createForm(
  { attributes } = {
    attributes: "",
  },
) {
  const form = document.createElement("form");
  form.innerHTML = `
    <a-form-field>
      <label for="textinput1">label top</label>
      <input ${attributes} name="test" placeholder="Placeholder" type="text">
      <a-form-field-error></a-form-field-error>
    </a-form-field>
  `;

  const field = form.querySelector<FormFieldElement>("a-form-field");
  if (!field) throw new Error("field not found");

  const input = form[0] as HTMLInputElement | undefined;
  if (!input) throw new Error("input not found");

  document.body.append(form);

  return {
    form,
    input,
    field,
  };
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

// test if validation attributes are set correctly

test("invalid attribute", async () => {
  const { field, input } = createForm({
    attributes: "required",
  });

  // should not happend on input, only on change
  input.dispatchEvent(new Event("input", { bubbles: true }));

  await sleep();
  expect(field.hasAttribute("invalid")).toBe(false);

  input.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep();

  expect(input.checkValidity()).toBe(false);
  expect(field.hasAttribute("invalid")).toBe(true);

  await type(input, "test");

  expect(input.reportValidity()).toBe(true);
});

// error reporting

test("form field validation emits error", async () => {
  const { field, input } = createForm({
    attributes: "required",
  });

  let emited = false;
  field.addEventListener("field-state", (e) => {
    if (e.detail.valid === false) {
      emited = true;
    }
  });

  input.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep();

  expect(input.checkValidity()).toBe(false);
  expect(field.hasAttribute("invalid")).toBe(true);
  expect(emited).toBe(true);
});

// reset emits change event

test("change events on reset", async () => {
  const { form, input } = createForm({
    attributes: "required",
  });

  let emited = false;
  input.addEventListener("change", (e) => {
    emited = true;
  });

  form.reset();
  await sleep();

  expect(emited).toBe(true);
});

// form field error shows error

test("form field error shows error", async () => {
  // TODO: should test if a-form-field-error contains the error message, not working in happy-dom
});

// test errors propogate back to the inputs

test("form error backpropagates to inputs", async () => {
  const { form, field, input } = createForm({
    attributes: "required",
  });

  const states = [];

  field.addEventListener("field-state", (e) => {
    states.push(e.detail.valid);
  });

  form.dispatchEvent(
    new CustomEvent("error", { detail: { name: "test", message: ["custom error"] } }),
  );

  await sleep();

  form.reportValidity();

  expect(states).toEqual([true, false]);
});

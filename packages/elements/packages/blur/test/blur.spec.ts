import { test, expect, it, beforeAll } from "bun:test";
import type { Blur } from "../src/Blur.js";

const NODE_NAME = "a-blur";

test("import element", async () => {
  const { Blur } = await import("@sv/elements/blur");
  expect(Blur).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Blur()).toBeInstanceOf(Blur);

  // upgrades when added to the DOM
  const ele = document.createElement("div");
  ele.innerHTML = `<${NODE_NAME} />`;
  expect(ele.children[0]).toBeInstanceOf(Blur);
});

test("enabled property", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("enabled", "");
  expect(blur.enabled).toBe(true);
});

test("close on esc", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("enabled", "");
  expect(blur.enabled).toBe(true);

  press(window, "Escape");
  expect(blur.enabled).toBe(false);
});

test("close on outside click", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("enabled", "");
  expect(blur.enabled).toBe(true);

  const content = blur.querySelector("div");

  click(content);
  expect(blur.enabled).toBe(true);

  click(blur);
  expect(blur.enabled).toBe(false);
});

test("focus first focusable element", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  const trigger = root.querySelector(".trigger");

  // trigger isKeyboard to true
  press(document, "Tab");

  trigger.focus();
  trigger.click();
  expect(blur.enabled).toBe(true);

  // focuses the first focusable element inside the blur
  expect(document.activeElement?.className).toBe("close");

  press(document, "Escape");

  // focus is restored to the trigger on close
  expect(document.activeElement?.className).toBe("trigger");
});

// TODO: test scorlling inside blur content
test("scroll lock", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("scrolllock", "");
  blur.enable();

  // blur is scroll locked
  expect(blur.lock.enabled).toBe(true);

  blur.disable();
  expect(blur.lock.enabled).toBe(false);

  // disable scroll lock
  blur.removeAttribute("scrolllock");

  blur.enable();
  expect(blur.lock.enabled).toBe(false);
});

test("aria attributes", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.enable();

  expect(blur.getAttribute("role")).toBe("dialog");

  expect(blur.hasAttribute("inert")).toBe(false);
  expect(blur.hasAttribute("aria-hidden")).toBe(false);

  blur.disable();
  expect(blur.hasAttribute("inert")).toBe(true);
  expect(blur.hasAttribute("aria-hidden")).toBe(true);
});

test("allowed scroll elements match content", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  const content = blur.querySelector("div");

  let matched = false;
  for (const selector of blur.lock.options.allowElements) {
    if (content.matches(selector)) {
      matched = true;
      break;
    }
  }

  expect(matched).toBe(true);
});

function press(ele: HTMLElement, key: string) {
  ele.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  ele.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
}

function click(ele: HTMLElement) {
  ele.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

async function createBlur() {
  await import("@sv/elements/blur");
  const ele = document.createElement("div");
  document.body.appendChild(ele);

  ele.innerHTML = `
    <button class="trigger">Open</button>

    <a-blur style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
      <div>
        <h1>Modal</h1>
        <p>Click outside of this modal to close it.</p>
        <button class="close">Close</button>
      </div>
    </a-blur>
  `;

  const blur = ele.querySelector<Blur>(NODE_NAME);
  const close = ele.querySelector(".close");

  // hack offsetWidth to make fucusableElements() work
  Object.defineProperty(close, "offsetWidth", {
    writable: true,
  });
  close.offsetWidth = 100;

  const trigger = ele.querySelector("button");
  trigger.addEventListener("click", () => {
    blur.enable();
  });

  return ele;
}

test("autoinert attribute disables inert", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("autoinert", "false");

  blur.enable();
  expect(blur.hasAttribute("inert")).toBe(false);
  expect(blur.hasAttribute("aria-hidden")).toBe(false);

  blur.disable();
  expect(blur.hasAttribute("inert")).toBe(false);
  expect(blur.hasAttribute("aria-hidden")).toBe(false);
});

test("initialfocus=false prevent autofocusing", async () => {
  const root = await createBlur();
  const blur = root.querySelector("a-blur");
  blur.setAttribute("initialfocus", "false");

  const trigger = document.querySelector("button.trigger");
  trigger.focus();

  blur.enable();
  expect(document.activeElement.className).toBe("trigger");

  blur.disable();
  expect(document.activeElement.className).toBe("trigger");
});

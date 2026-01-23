import { test, expect, it, beforeAll, afterEach } from "bun:test";
import type { Blur } from "../src/Blur.js";

const NODE_NAME = "a-blur";

afterEach(() => {
  document.body.innerHTML = "";
});

test("import element", async () => {
  const { Blur } = await import("../dist/index.js");
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
  await import("../dist/index.js");
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

// Helper custom element with shadow root for testing
class TestShadowElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<button class="shadow-button">Shadow Button</button>`;
  }
}

// Define custom element if not already defined
if (!customElements.get("test-shadow-element")) {
  customElements.define("test-shadow-element", TestShadowElement);
}

test("findFocusableElements: scenario 1 - direct button", async () => {
  await import("../dist/index.js");
  const container = document.createElement("div");
  document.body.appendChild(container);

  container.innerHTML = `
    <a-blur enabled>
      <button class="direct-button">Direct Button</button>
    </a-blur>
  `;

  const blur = container.querySelector("a-blur");
  const button = container.querySelector(".direct-button");

  // Wait for custom element to be upgraded
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Hack offsetWidth to make focusableElements() work
  Object.defineProperty(button, "offsetWidth", { value: 100 });

  // Trigger keyboard mode for autofocus
  press(document, "Tab");
  blur.enable();

  // Should focus the direct button
  expect(document.activeElement).toBe(button);

  document.body.removeChild(container);
});

test("findFocusableElements: scenario 2 - slotted button", async () => {
  await import("../dist/index.js");
  const container = document.createElement("div");
  document.body.appendChild(container);

  container.innerHTML = `
    <a-blur enabled>
      <button class="slotted-button">Slotted Button</button>
    </a-blur>
  `;

  const blur = container.querySelector("a-blur");
  const button = container.querySelector(".slotted-button");

  // Wait for custom element to be upgraded
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Hack offsetWidth to make focusableElements() work
  Object.defineProperty(button, "offsetWidth", { value: 100 });

  // Trigger keyboard mode for autofocus
  press(document, "Tab");
  blur.enable();

  // Should focus the slotted button
  expect(document.activeElement).toBe(button);

  document.body.removeChild(container);
});

test("findFocusableElements: scenario 3 - shadow root button", async () => {
  await import("../dist/index.js");
  const container = document.createElement("div");
  document.body.appendChild(container);

  container.innerHTML = `
    <a-blur enabled>
      <test-shadow-element></test-shadow-element>
    </a-blur>
  `;

  const blur = container.querySelector("a-blur");
  const shadowElement = container.querySelector("test-shadow-element");

  // Wait for custom element to be upgraded
  await new Promise((resolve) => setTimeout(resolve, 0));

  const shadowButton = shadowElement.shadowRoot.querySelector(".shadow-button");

  // Hack offsetWidth to make focusableElements() work
  Object.defineProperty(shadowButton, "offsetWidth", { value: 100 });

  // Trigger keyboard mode for autofocus
  press(document, "Tab");
  blur.enable();

  // Should focus the button inside shadow root
  expect(document.activeElement).toBe(shadowElement);
  expect(shadowElement.shadowRoot.activeElement).toBe(shadowButton);

  document.body.removeChild(container);
});

test("findFocusableElements: scenario 4 - slotted element with shadow root button", async () => {
  await import("../dist/index.js");
  const container = document.createElement("div");
  document.body.appendChild(container);

  container.innerHTML = `
    <a-blur enabled>
      <test-shadow-element class="slotted-shadow"></test-shadow-element>
    </a-blur>
  `;

  const blur = container.querySelector("a-blur");
  const shadowElement = container.querySelector(".slotted-shadow");

  // Wait for custom element to be upgraded
  await new Promise((resolve) => setTimeout(resolve, 0));

  const shadowButton = shadowElement.shadowRoot.querySelector(".shadow-button");

  // Hack offsetWidth to make focusableElements() work
  Object.defineProperty(shadowButton, "offsetWidth", { value: 100 });

  // Trigger keyboard mode for autofocus
  press(document, "Tab");
  blur.enable();

  // Should focus the button inside the slotted element's shadow root
  expect(document.activeElement).toBe(shadowElement);
  expect(shadowElement.shadowRoot.activeElement).toBe(shadowButton);

  document.body.removeChild(container);
});

test("findFocusableElements: all 4 scenarios together with tab navigation", async () => {
  await import("../dist/index.js");
  const container = document.createElement("div");
  document.body.appendChild(container);

  container.innerHTML = `
    <a-blur enabled>
      <button class="btn-1">Button 1 - Direct</button>
      <button class="btn-2">Button 2 - Slotted</button>
      <test-shadow-element class="shadow-1"></test-shadow-element>
      <test-shadow-element class="shadow-2"></test-shadow-element>
    </a-blur>
  `;

  const blur = container.querySelector("a-blur");
  const btn1 = container.querySelector(".btn-1");
  const btn2 = container.querySelector(".btn-2");
  const shadow1 = container.querySelector(".shadow-1");
  const shadow2 = container.querySelector(".shadow-2");

  // Wait for custom elements to be upgraded
  await new Promise((resolve) => setTimeout(resolve, 0));

  const shadowBtn1 = shadow1.shadowRoot.querySelector(".shadow-button");
  const shadowBtn2 = shadow2.shadowRoot.querySelector(".shadow-button");

  // Hack offsetWidth for all buttons
  [btn1, btn2, shadowBtn1, shadowBtn2].forEach((btn) => {
    Object.defineProperty(btn, "offsetWidth", { value: 100 });
  });

  // Trigger keyboard mode for autofocus
  press(document, "Tab");
  blur.enable();

  // Should focus first button
  expect(document.activeElement).toBe(btn1);

  // Manually simulate Tab navigation since test environment doesn't have native Tab behavior
  // The blur component only handles wrapping at boundaries, not middle navigation
  btn2.focus();
  expect(document.activeElement).toBe(btn2);

  shadowBtn1.focus();
  expect(document.activeElement).toBe(shadow1);
  expect(shadow1.shadowRoot.activeElement).toBe(shadowBtn1);

  shadowBtn2.focus();
  expect(document.activeElement).toBe(shadow2);
  expect(shadow2.shadowRoot.activeElement).toBe(shadowBtn2);

  // Tab from last element should wrap around to first button (this is handled by blur component)
  press(document, "Tab");
  expect(document.activeElement).toBe(btn1);

  // Shift+Tab from first element should go to last element (this is handled by blur component)
  const reverseTab = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: true,
    bubbles: true,
  });
  document.dispatchEvent(reverseTab);
  expect(document.activeElement).toBe(shadow2);

  document.body.removeChild(container);
});

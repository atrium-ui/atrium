import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-portal";

test("import a-portal element", async () => {
  const { Portal } = await import("@sv/elements/portal");
  expect(Portal).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-portal element", async () => {
  const { Portal } = await import("@sv/elements/portal");

  // is constructable
  expect(new Portal()).toBeInstanceOf(Portal);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Portal);
});

// Test events beeing proxied
test("portal events", async () => {
  const ele = await newElement();
  const portal = document.querySelector("a-portal");
  const button = portal.querySelector("button");

  let blurEvent = false;
  portal.addEventListener("blur", (e) => {
    blurEvent = true;
  });
  let changeEvent = false;
  portal.addEventListener("change", (e) => {
    changeEvent = true;
  });

  button.dispatchEvent(new Event("blur", { bubbles: true }));
  button.dispatchEvent(new Event("change", { bubbles: true }));

  expect(blurEvent).toBe(true);
  expect(changeEvent).toBe(true);

  ele.remove();
});

test("portal target exists", async () => {
  const ele = await newElement();
  const portal = document.querySelector("a-portal");

  expect(portal.portalId).toBeDefined();

  // portal target exists in document
  expect(document.querySelector(`[data-portal-id="${portal.portalId}"]`)).toBeDefined();

  ele.remove();
});

test("portal target is removed with portal", async () => {
  const ele = await newElement();
  const portal = document.querySelector("a-portal");

  // portal target exists in document
  expect(document.querySelector(`[data-portal-id="${portal.portalId}"]`)).toBeDefined();

  ele.remove();

  expect(document.querySelector(`[data-portal-id="${portal.portalId}"]`)).toBeNull();
});

test("portal children", async () => {
  const ele = await newElement();
  const portal = document.querySelector("a-portal");

  await sleep(1);

  expect(portal.children[0].tagName).toBe("BUTTON");
});

async function newElement() {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-portal>
      <button type="button">Button</button>
    </a-portal>
  `;

  document.body.append(ele);
  return ele;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

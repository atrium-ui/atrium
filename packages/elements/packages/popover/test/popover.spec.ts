import { test, expect } from "bun:test";

const NODE_NAME = "a-popover";

test("import element", async () => {
  const { Popover } = await import("@atrium-ui/elements/popover");
  expect(Popover).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Popover()).toBeInstanceOf(Popover);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Popover);
});

test("initial state", async () => {
  const { PopoverTrigger } = await import("@atrium-ui/elements/popover");
  const ele = new PopoverTrigger();

  expect(ele.opened).toBe(false);
});

test("trigger click", async () => {
  const popover = await createPopover();
  const tirgger = popover.querySelector("a-popover-trigger");
  const button = popover.querySelector("button");
  button.click();
  expect(tirgger.opened).toBe(true);
  button.click();
  expect(tirgger.opened).toBe(false);
});

test("trigger aria attributes", async () => {
  const popover = await createPopover();
  const button = popover.querySelector("button");
  const tirgger = popover.querySelector("a-popover-trigger");

  expect(button.getAttribute("aria-haspopup")).toBe("dialog");
  expect(button.getAttribute("aria-expanded")).toBe("false");

  button.click();

  expect(button.getAttribute("aria-expanded")).toBe("true");
});

test("popover no scrolllock", async () => {
  const popover = await createPopover();
  const btn = popover.querySelector("button");
  btn.click();

  const content = document.querySelector("a-popover-portal");
  expect(content.lock.enabled).toBe(false);
});

test("slotting names", async () => {
  const ele = await createPopover();
  const popover = ele.querySelector("a-popover");
  const trigger = ele.querySelector("a-popover-trigger");

  // TOOD: find a way to test assigned slots
});

async function createPopover() {
  await import("@atrium-ui/elements/popover");
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-popover-trigger>
      <button type="button" slot="trigger">
        Label
      </button>

      <a-popover>
        <div>Content</div>
      </a-popover>
    </a-popover-trigger>
  `;
  document.body.append(ele);
  return ele;
}

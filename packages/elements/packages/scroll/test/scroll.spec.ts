import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-scroll";

test("import element", async () => {
  const { ScrollElement } = await import("@sv/elements/scroll");
  expect(ScrollElement).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct element", async () => {
  const { ScrollElement } = await import("@sv/elements/scroll");

  // is constructable
  expect(new ScrollElement()).toBeInstanceOf(ScrollElement);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(ScrollElement);
});

test("scroll position is restored from sessionStorage", async () => {
  const ele = await newElement();
  const scroll = ele.querySelector("a-scroll");

  scroll.scrollTop = 100;

  // simulate page reload
  window.dispatchEvent(new Event("beforeunload"));
  ele.remove();
  scroll.scrollTop = 0;

  document.body.append(ele);
  expect(scroll.scrollTop).toBe(100);
});

test("name attribute", async () => {
  const ele = await newElementWithName("foo");

  const scroll = ele.querySelector("a-scroll");
  scroll.scrollTop = 100;
  // TOOD: weird, that this doesnt work withput this
  scroll.attributeChangedCallback("name", undefined, "foo");

  expect(scroll.name).toBe("foo");

  const ele2 = await newElement();
  const scroll2 = ele2.querySelector("a-scroll");
  scroll2.scrollTop = 200;

  await sleep(1);

  // simulate page reload
  window.dispatchEvent(new Event("beforeunload"));
  ele.remove();
  ele2.remove();
  scroll.scrollTop = 0;
  scroll2.scrollTop = 0;

  document.body.append(ele);
  document.body.append(ele2);

  expect(scroll.scrollTop).toBe(100);
  expect(scroll2.scrollTop).toBe(200);
});

async function newElement() {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-scroll>
      <button type="button">Button</button>
    </a-scroll>
  `;
  document.body.append(ele);
  return ele;
}

async function newElementWithName(name: string) {
  const ele = document.createElement("div");
  ele.innerHTML = `
    <a-scroll name="${name}">
      <button type="button">Button</button>
    </a-scroll>
  `;
  document.body.append(ele);
  return ele;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

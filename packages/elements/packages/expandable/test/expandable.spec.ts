import { test, expect, afterEach, describe, beforeEach } from "bun:test";

const NODE_NAME = "a-expandable";

describe("Expandable", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  beforeEach(() => {
    window.dispatchEvent(new Event("load"));
  });

  test("import element", async () => {
    const { Expandable } = await import("../src/index.js");
    expect(Expandable).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get(NODE_NAME)).toBeDefined();

    // is constructable
    expect(new Expandable()).toBeInstanceOf(Expandable);

    const html = `<${NODE_NAME} />`;
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Expandable);
  });

  test("change event", async () => {
    const ele = await newExpandable();

    let changed = false;
    ele.addEventListener("change", () => {
      changed = true;
    });

    ele.opened = true;
    expect(changed).toBeFalse();

    // only from use interaction
    ele.open();
    expect(changed).toBeTrue();
  });

  test("open and close", async () => {
    const ele = await newExpandable();

    expect(ele.opened).toBe(false);

    expect(ele.outerHTML).toMatchSnapshot("closed");

    ele.open();
    expect(ele.opened).toBe(true);

    ele.close();
    expect(ele.opened).toBe(false);

    open(ele);
    expect(ele.opened).toBe(true);

    expect(ele.outerHTML).toMatchSnapshot("opened");
  });

  test("initialy opened", async () => {
    const ele = await newExpandableOpened();

    expect(ele.opened).toBe(true);
  });

  test("unique ids", async () => {
    const ele = await newExpandableOpened();
    const ele2 = await newExpandableOpened();

    expect(ele._id_toggle).not.toEqual(ele2._id_toggle);
    expect(ele._id_content).not.toEqual(ele2._id_content);
  });

  test("aria attributes", async () => {
    const ele = await newExpandable();

    const trigger = ele.trigger;

    expect(trigger.getAttribute("aria-controls")).toBe(ele._id_content);
    expect(trigger.id).toBe(ele._id_toggle);

    const content = ele.content;
    expect(content?.getAttribute("aria-labelledby")).toBe(ele._id_toggle);

    open(ele);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.getAttribute("aria-hidden")).toBe("false");
  });

  test("no change event when attribute is changed", async () => {
    const ele = await newExpandable();

    expect(ele.opened).toBe(false);

    let changeEvent = false;
    ele.addEventListener("change", () => {
      changeEvent = true;
    });

    ele.setAttribute("opened", "true");
    expect(ele.opened).toBe(true);

    await sleep(1);

    expect(changeEvent).toBe(false);
  });

  test("scrollIntoView is not called on mount", async () => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = () => {
      throw new Error("scrollIntoView was called");
    };

    try {
      const ele = await newExpandable();
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });
});

async function newExpandable() {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-expandable>
      <button slot="toggle" type="button">
        <div class="headline">Title</div>
      </button>

      <div>Content</div>
    </a-expandable>
  `;

  const expandable = ele.querySelector("a-expandable");
  document.body.appendChild(ele);
  const ex = expandable as any;
  ex.onSlotChange();
  return ex;
}

async function newExpandableOpened() {
  const ele = document.createElement("div");

  ele.innerHTML = `
    <a-expandable opened>
      <button slot="toggle" type="button">
        <div class="headline">Title</div>
      </button>

      <div>Content</div>
    </a-expandable>
  `;

  const expandable = ele.querySelector("a-expandable");
  document.body.appendChild(ele);
  const ex = expandable as any;
  ex.onSlotChange();
  return ex;
}

function open(ele) {
  ele.onClick({ target: ele.trigger });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

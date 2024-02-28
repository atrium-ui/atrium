import { describe, expect, it, beforeAll } from "bun:test";
import { type Blur } from "./Blur.js";

const NODE_NAME = "a-blur";

describe(NODE_NAME, () => {
  function createBlur() {
    const blur = document.createElement(NODE_NAME) as Blur;
    document.body.appendChild(blur);
    return blur;
  }

  it("import element", async () => {
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

  it("enabled property", async () => {
    const blur = createBlur();
    blur.setAttribute("enabled", "");
    expect(blur.enabled).toBe(true);
  });
});

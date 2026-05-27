import { test, expect, afterEach, beforeAll, describe } from "bun:test";

/**
 * Tabs regressions surfaced by the TC39 standard-decorator migration.
 *
 * Symptom (manual): tab panels render with no visible content even after the
 * user clicks a tab.
 *
 * The Tabs panel uses `hidden="until-found"` when `!this.selected`. The parent
 * `<a-tabs>` flips selection by assigning `panel.selected = true`. With TC39
 * auto-accessors that goes through the Lit-wrapped setter and should trigger
 * `requestUpdate` + a re-render that drops the `hidden` attribute.
 *
 * These tests pin that contract down so we can iterate on the fix.
 */
describe("Tabs — TC39 decorator regressions", () => {
  let TabsPanelElement: any;

  beforeAll(async () => {
    // The dist/index.js only registers the elements; it doesn't re-export the
    // classes. Pull the class out of the registry once the side-effect ran.
    await import("../dist/index.js");
    TabsPanelElement = customElements.get("a-tabs-panel");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("bundler must give each class its own WeakMap binding for `selected`", async () => {
    // Root cause: bun.build emits `var _selected = new WeakMap()` twice in
    // the same module scope (once for TabsPanelElement, once for
    // TabsTabElement). `var` hoisting collapses them to one binding, so the
    // class constructor and the `__decorateElement` registration see
    // *different* WeakMap instances depending on evaluation order — the
    // accessor ends up reading a WeakMap that was never written to. esbuild
    // renames the duplicates (`_selected` / `_selected2`); bun.build doesn't.
    const src = await Bun.file(
      new URL("../dist/index.js", import.meta.url).pathname,
    ).text();
    const declarations = src.match(/var _selected\b/g) ?? [];
    // If there are 2+ identical `var _selected` declarations, the same
    // binding is being reused and the WeakMaps collide.
    expect(declarations.length).toBeLessThanOrEqual(1);
  });

  test("panel parsed from innerHTML with `selected` attribute does not crash", () => {
    // happy-dom fires attributeChangedCallback during innerHTML parsing for
    // observed attributes. Lit's setter reads the prior value via
    // __privateGet — which throws when the WeakMap entry hasn't been added
    // yet by the (presumed) deferred upgrade. Real browsers run the
    // constructor before attributeChangedCallback; happy-dom appears not to.
    expect(() => {
      document.body.innerHTML = `<a-tabs-panel selected>content</a-tabs-panel>`;
    }).not.toThrow();

    const panel = document.querySelector("a-tabs-panel") as any;
    expect(panel).toBeInstanceOf(TabsPanelElement);
    expect(panel.selected).toBe(true);
  });

  test("programmatically assigning panel.selected drops hidden=until-found", async () => {
    // Use createElement so the constructor runs before any attribute writes —
    // isolates the "post-construction property assignment" path from the
    // happy-dom parse-time hazard above.
    const panel = document.createElement("a-tabs-panel") as any;
    document.body.append(panel);
    await panel.updateComplete;

    panel.selected = true;
    await panel.updateComplete;

    const inner = panel.shadowRoot?.querySelector(".tabs-panel") as HTMLElement;
    expect(inner).toBeTruthy();
    expect(inner.getAttribute("hidden")).toBeNull();
    expect(inner.getAttribute("aria-hidden")).toBe("false");
  });

  test("tab-selected event flips the matching panel's selected property", async () => {
    // Build the tree programmatically to dodge the parse-time hazard.
    const tabs = document.createElement("a-tabs");
    const list = document.createElement("a-tabs-list");
    const tab1 = document.createElement("a-tabs-tab");
    const tab2 = document.createElement("a-tabs-tab");
    const panel1 = document.createElement("a-tabs-panel") as any;
    const panel2 = document.createElement("a-tabs-panel") as any;
    list.append(tab1, tab2);
    tabs.append(list, panel1, panel2);
    document.body.append(tabs);

    await panel1.updateComplete;
    await panel2.updateComplete;

    tab2.dispatchEvent(
      new CustomEvent("tab-selected", {
        detail: { index: 1, scrollToSelected: false },
        bubbles: true,
        composed: true,
      }),
    );

    await panel1.updateComplete;
    await panel2.updateComplete;

    expect(panel1.selected).toBe(false);
    expect(panel2.selected).toBe(true);
  });
});

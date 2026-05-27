import { test, expect, afterEach, describe } from "bun:test";
// Load from the built dist — that's what consumers ship and what reproduces
// the TC39 emit. Importing src bypasses the regression because bun's runtime
// transpile may emit decorators differently than the esbuild prebuild.
const { Select } = await import("../dist/index.js");

/**
 * Regressions introduced by the TC39 standard-decorator migration.
 *
 * Lit `@property accessor x` is compiled by esbuild into a WeakMap-backed
 * private slot (`__privateAdd`/`__privateGet`/`__privateSet`) populated *after*
 * `super()` in the constructor. Several flows that worked under experimental
 * decorators (plain instance fields, no WeakMap) now hit the private slot
 * before the constructor has installed it.
 */
describe("Select — TC39 decorator regressions", () => {
  test("bundler must give each class its own WeakMap binding for `value`", async () => {
    // Option declares `accessor value` and Select declares `accessor value`.
    // bun.build emits `var _value = new WeakMap()` twice in module scope and
    // `var` hoisting collapses them — accessor metadata ends up pointing at
    // a WeakMap that was never populated for the right instances.
    const src = await Bun.file(
      new URL("../dist/index.js", import.meta.url).pathname,
    ).text();
    const declarations = src.match(/var _value\b/g) ?? [];
    expect(declarations.length).toBeLessThanOrEqual(1);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("attributes set during innerHTML parsing must not crash the property getter", () => {
    // Parser sets `name`, `value`, `disabled` before / interleaved with the
    // custom-element upgrade; Lit's attributeChangedCallback then reads the
    // property to get the old value. Under TC39 emit that hits __privateGet
    // before the WeakMap entry exists.
    expect(Select).toBeDefined();
    const div = document.createElement("div");
    expect(() => {
      div.innerHTML = `
        <a-select name="test" value="2" disabled>
          <button type="button" slot="trigger">Trigger</button>
          <a-option value="1">One</a-option>
          <a-option value="2">Two</a-option>
        </a-select>
      `;
    }).not.toThrow();
    document.body.append(div);
  });

  test("constructing via document.createElement then setting attributes works", () => {
    // Programmatic path: createElement runs the constructor first, then we
    // set attributes — this is the order TC39-style auto-accessors expect.
    const el = document.createElement("a-select") as Select;
    expect(() => {
      el.setAttribute("name", "test");
      el.setAttribute("value", "2");
      el.setAttribute("disabled", "");
    }).not.toThrow();
  });

  test("reading the property before any attribute change returns the initializer default", () => {
    const el = document.createElement("a-select") as Select;
    // Defaults from the source: opened=false, disabled=false, required=false,
    // direction="down". If __privateAdd ran after super() these all read OK.
    expect(el.opened).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.required).toBe(false);
    expect(el.direction).toBe("down");
  });
});

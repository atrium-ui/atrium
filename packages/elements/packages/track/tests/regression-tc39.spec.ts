import { test, expect, afterEach, beforeAll, describe } from "bun:test";

/**
 * Track regressions surfaced by the TC39 standard-decorator migration.
 *
 * Symptom (manual): `<a-track>` is invisible — host element appears collapsed
 * or content is not laid out.
 *
 * Track exposes boolean reflecting properties (`vertical`, `loop`, `snap`,
 * `overflow`, …) that drive `:host(...)` style selectors. Under TC39
 * auto-accessor emit, attribute → property hand-off goes through Lit's
 * decorator wrapper plus WeakMap storage; any breakage in that path makes
 * the host fail to apply layout styles.
 */
describe("Track — TC39 decorator regressions", () => {
  let Track: any;

  beforeAll(async () => {
    // Load dist for its side-effect (customElements.define). Use the registry
    // to grab the class reference — track.spec.ts in the same suite imports
    // from src/, so whichever file ran first owns the `a-track` registration.
    await import("../dist/index.js");
    Track = customElements.get("a-track");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("parsed boolean attributes initialize matching properties", () => {
    document.body.innerHTML = `
      <a-track vertical loop snap></a-track>
    `;
    const track = document.querySelector("a-track") as any;
    expect(track).toBeInstanceOf(Track);
    expect(track.vertical).toBe(true);
    expect(track.loop).toBe(true);
    expect(track.snap).toBe(true);
  });

  test("default property values are readable immediately after construction", () => {
    const track = document.createElement("a-track") as any;
    // initializer defaults from Track.ts
    expect(track.vertical).toBe(false);
    expect(track.loop).toBe(false);
    expect(track.snap).toBe(false);
    expect(track.align).toBe("start");
    expect(track.overflow).toBe("auto");
    expect(track.debug).toBe(false);
  });

  test("assigning a reflecting property writes the attribute to the host", async () => {
    document.body.innerHTML = `<a-track></a-track>`;
    const track = document.querySelector("a-track") as any;
    track.vertical = true;
    await track.updateComplete;
    expect(track.hasAttribute("vertical")).toBe(true);
  });

  test("host renders a slot in shadow DOM so children are projected", async () => {
    document.body.innerHTML = `
      <a-track>
        <div style="width:100px;height:100px">a</div>
        <div style="width:100px;height:100px">b</div>
      </a-track>
    `;
    const track = document.querySelector("a-track") as any;
    await track.updateComplete;
    const slot = track.shadowRoot?.querySelector("slot");
    expect(slot).toBeTruthy();
  });
});

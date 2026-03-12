import { afterAll, afterEach, beforeAll, expect, test } from "bun:test";
import type { Lightbox } from "../src/Lightbox.js";

const NODE_NAME = "a-lightbox";
const originalStartViewTransition = document.startViewTransition;

beforeAll(() => {
  document.startViewTransition = ((updateCallback: () => void | Promise<void>) => {
    const result = Promise.resolve(updateCallback());
    return {
      finished: result.then(() => undefined),
      updateCallbackDone: result.then(() => undefined),
    };
  }) as typeof document.startViewTransition;
});

afterAll(() => {
  document.startViewTransition = originalStartViewTransition;
});

afterEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  document.body.style.scrollbarGutter = "";
});

test("import element", async () => {
  const { Lightbox } = await import("../dist/index.js");
  expect(Lightbox).toBeDefined();
  expect(customElements.get(NODE_NAME)).toBeDefined();
  expect(new Lightbox()).toBeInstanceOf(Lightbox);
});

test("opens and closes through the public api", async () => {
  const lightbox = await createLightbox();

  expect(lightbox.portalElement).toBeNull();

  await lightbox.show();
  expect(lightbox.opened).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  expect(lightbox.portalElement).toBeDefined();

  await lightbox.hide();
  await lightbox.updateComplete;
  expect(lightbox.opened).toBe(false);
  expect(document.body.style.overflow).toBe("");
  expect(lightbox.portalElement).toBeNull();

  await lightbox.show();
  expect(lightbox.opened).toBe(true);
});

test("opens from trigger click and closes from close click", async () => {
  const lightbox = await createLightbox();
  const trigger = lightbox.querySelector<HTMLElement>('[slot="trigger"]');

  trigger?.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await lightbox.updateComplete;
  expect(lightbox.opened).toBe(true);

  const close = lightbox.closeElements[0] as HTMLElement | undefined;
  close?.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await lightbox.updateComplete;
  expect(lightbox.opened).toBe(false);
});

test("repeated trigger activation does not corrupt state", async () => {
  const lightbox = await createLightbox();
  const trigger = lightbox.querySelector<HTMLElement>('[slot="trigger"]');

  trigger?.click();
  trigger?.click();
  trigger?.click();

  await new Promise((resolve) => setTimeout(resolve, 0));
  await lightbox.updateComplete;
  expect(lightbox.opened).toBe(true);

  await lightbox.hide();
  expect(lightbox.opened).toBe(false);

  await lightbox.show();
  expect(lightbox.opened).toBe(true);
});

test("closes from nested click inside close slot", async () => {
  await import("../dist/index.js");
  const host = document.createElement("div");
  document.body.append(host);

  host.innerHTML = `
    <a-lightbox>
      <button slot="trigger" type="button">
        <img src="/thumb.jpg" alt="" />
      </button>
      <div slot="content">
        <img src="/large.jpg" alt="" />
      </div>
      <div slot="close">
        <button type="button"><span>Close</span></button>
      </div>
    </a-lightbox>
  `;

  const lightbox = host.querySelector<Lightbox>(NODE_NAME);
  const nested = host.querySelector<HTMLSpanElement>('[slot="close"] span');
  if (!lightbox || !nested) {
    throw new Error("failed to create nested close test");
  }

  await lightbox.show();
  nested.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  expect(lightbox.opened).toBe(false);
});

test("throws when a required image is missing", async () => {
  await import("../dist/index.js");
  const host = document.createElement("div");
  document.body.append(host);

  host.innerHTML = `
    <a-lightbox>
      <button slot="trigger">Open</button>
      <div slot="content"><img src="/large.jpg" alt="" /></div>
      <button slot="close" type="button">Close</button>
    </a-lightbox>
  `;

  const lightbox = host.querySelector<Lightbox>(NODE_NAME);

  await expect(lightbox?.show()).rejects.toThrow(
    'a-lightbox requires an <img> inside the "trigger" slot',
  );
});

function createLightbox() {
  return import("../dist/index.js").then(async () => {
    const host = document.createElement("div");
    document.body.append(host);

    host.innerHTML = `
      <a-lightbox>
        <button slot="trigger" type="button">
          <img src="/thumb.jpg" alt="" />
        </button>
        <div slot="content">
          <img src="/large.jpg" alt="" />
        </div>
        <button slot="close" type="button">Close</button>
      </a-lightbox>
    `;

    const lightbox = host.querySelector<Lightbox>(NODE_NAME);
    if (!lightbox) {
      throw new Error("failed to create a-lightbox");
    }

    await Promise.resolve();
    return lightbox;
  });
}

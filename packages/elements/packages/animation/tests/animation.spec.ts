import { beforeAll, test, expect } from "bun:test";
import type { AnimationElement } from "@sv/elements/animation";

beforeAll(async () => {
  const { AnimationElement } = await import("@sv/elements/animation");
  expect(AnimationElement).toBeDefined();

  const ele = new AnimationElement();
  globalThis.ele = ele;
});

test("a-animation: defaults", async () => {
  const ele = globalThis.ele as AnimationElement;
  expect(ele.src).toBeUndefined();
  // @ts-ignore
  expect(ele.paused).toBeTrue();
});

// test("a-animation: loading", async () => {
//   const ele = globalThis.ele as AnimationElement;
//   ele.src = globalThis.riveFile;

//   // tryLoad will be called by LitElement.updated
//   await ele.tryLoad(globalThis.riveFile);

//   expect(ele.loaded).toBeFalse();

//   // set paused is only executed by intersection observer
//   ele.setPaused(false);

//   await ele.tryLoad(globalThis.riveFile);

//   expect(ele.loaded).toBeTrue();
// });

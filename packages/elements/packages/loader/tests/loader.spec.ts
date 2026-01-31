import { test, expect } from "bun:test";

test("import loader", async () => {
  const { LoaderElement } = await import("../dist/index.js");
  expect(LoaderElement).toBeDefined();

  const ele = new LoaderElement();
  globalThis.ele = ele;
});

import { describe, expect, it } from "bun:test";

describe("scroll-lock import", () => {
  it("import module", async () => {
    const out = await import("../dist/index.js");
    expect(out.ScrollLock).toBeDefined();
  });
});

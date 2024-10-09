import { describe, expect, it } from "bun:test";

describe("scroll-lock import", () => {
  it("import module", async () => {
    const out = await import(require.resolve("@atrium-ui/scroll-lock"));
    expect(out.ScrollLock).toBeDefined();
  });
});

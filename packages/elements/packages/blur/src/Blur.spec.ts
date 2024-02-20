import { describe, expect, it } from "bun:test";
import { type Blur } from "./Blur.js";

const NODE_NAME = "a-blur";

describe(NODE_NAME, () => {
	it("import element", async () => {
		const { Blur } = await import("@sv/elements/blur");
		expect(Blur).toBeDefined();

		// is defined in custom element registry
		expect(customElements.get(NODE_NAME)).toBeDefined();

		// is constructable
		expect(new Blur()).toBeInstanceOf(Blur);

		const ele = document.createElement("div");
		ele.innerHTML = `<${NODE_NAME} />`;

		expect(ele.children[0]).toBeInstanceOf(Blur);
	});

	it("enabled property", async () => {
		await import("@sv/elements/blur");

		const ele = document.createElement("div");
		ele.innerHTML = `<${NODE_NAME} />`;

		const blur = ele.querySelector<Blur>("a-blur");
		if (!blur) throw new Error("Element not found");

		blur.enabled = true;
		expect(blur.hasAttribute("enabled")).toBe(true);
	});
});

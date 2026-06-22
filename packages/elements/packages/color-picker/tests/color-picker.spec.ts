import { test, expect, describe } from "bun:test";

const NODE_NAME = "a-color-picker";

async function newPicker(
  options: {
    value?: string;
    alpha?: boolean;
    palette?: string;
    disabled?: boolean;
    name?: string;
  } = {},
) {
  const attrs: string[] = [];
  if (options.value) attrs.push(`value="${options.value}"`);
  if (options.alpha) attrs.push("alpha");
  if (options.palette) attrs.push(`palette="${options.palette}"`);
  if (options.disabled) attrs.push("disabled");
  if (options.name) attrs.push(`name="${options.name}"`);

  const wrap = document.createElement("div");
  wrap.innerHTML = `<a-color-picker ${attrs.join(" ")}></a-color-picker>`;
  document.body.append(wrap);

  const picker = wrap.querySelector("a-color-picker")!;
  await (picker as any).updateComplete;
  return { root: wrap, picker: picker as any };
}

function cleanup(root: HTMLElement) {
  root.remove();
}

// ── Import & registration ─────────────────────────────────────────────

test("import a-color-picker element", async () => {
  const { ColorPickerElement } = await import("../dist/index.js");
  expect(ColorPickerElement).toBeDefined();
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct a-color-picker element", () => {
  const el = document.createElement("a-color-picker");
  expect(el).toBeDefined();
});

// ── Default state ─────────────────────────────────────────────────────

describe("default state", () => {
  test("default value is #1d4ed8", async () => {
    const { root, picker } = await newPicker();
    expect(picker.value).toBe("#1d4ed8");
    cleanup(root);
  });

  test("renders 2D field, hue slider, and hex input", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    expect(sr.querySelector(".sv-field")).toBeTruthy();
    expect(sr.querySelector("[part~='hue-slider']")).toBeTruthy();
    expect(sr.querySelector(".hex-input")).toBeTruthy();
    cleanup(root);
  });

  test("hex input shows value without # in uppercase", async () => {
    const { root, picker } = await newPicker({ value: "#1d4ed8" });
    const sr = picker.shadowRoot!;
    const input = sr.querySelector<HTMLInputElement>(".hex-input")!;
    expect(input.value).toBe("1D4ED8");
    cleanup(root);
  });
});

// ── HSV sync from value ───────────────────────────────────────────────

describe("value → HSV sync", () => {
  test("pure red #ff0000 → s=100, v=100", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    expect(picker.svSat).toBe(100);
    expect(picker.svVal).toBe(100);
    cleanup(root);
  });

  test("pure blue #0000ff → h=240", async () => {
    const { root, picker } = await newPicker({ value: "#0000ff" });
    expect(picker.hue).toBe(240);
    cleanup(root);
  });

  test("pure black #000000 → v=0", async () => {
    const { root, picker } = await newPicker({ value: "#000000" });
    expect(picker.svVal).toBe(0);
    cleanup(root);
  });

  test("pure white #ffffff → s=0, v=100", async () => {
    const { root, picker } = await newPicker({ value: "#ffffff" });
    expect(picker.svSat).toBe(0);
    expect(picker.svVal).toBe(100);
    cleanup(root);
  });
});

// ── 2D field pointer interaction ──────────────────────────────────────

describe("2D field", () => {
  test("pointerdown fires input event", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    let inputFired = false;
    picker.addEventListener("input", () => {
      inputFired = true;
    });

    field.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 0, clientY: 0 }),
    );
    await picker.updateComplete;

    expect(inputFired).toBe(true);
    cleanup(root);
  });

  test("pointerup after drag fires change event", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    field.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    field.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    cleanup(root);
  });

  test("value is valid hex after interaction", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    field.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    field.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    await picker.updateComplete;

    expect(picker.value).toMatch(/^#[0-9a-f]{6}$/);
    cleanup(root);
  });

  test("dragging outside field clamps svSat to 0–100", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    // Mock getBoundingClientRect to give a sensible size
    field.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200 }) as DOMRect;

    field.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 100, clientY: 50 }),
    );
    await picker.updateComplete;
    expect(picker.svSat).toBeGreaterThanOrEqual(0);
    expect(picker.svSat).toBeLessThanOrEqual(100);
    expect(picker.svVal).toBeGreaterThanOrEqual(0);
    expect(picker.svVal).toBeLessThanOrEqual(100);
    cleanup(root);
  });

  test("field pointer sets correct saturation and value with mocked rect", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    field.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;

    // Click at 75% x, 25% y → svSat=75, svVal=75 (inverted y)
    field.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 75, clientY: 25 }),
    );
    await picker.updateComplete;

    expect(picker.svSat).toBe(75);
    expect(picker.svVal).toBe(75);
    cleanup(root);
  });
});

// ── Hue slider ────────────────────────────────────────────────────────

describe("hue slider", () => {
  function mockHueTrack(sr: ShadowRoot, width = 360) {
    const slider = sr.querySelector<HTMLElement>("[part~='hue-slider']")!;
    slider.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width, height: 28, right: width, bottom: 28 }) as DOMRect;
    return slider;
  }

  test("dragging right increases hue by delta", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" }); // hue=0
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360); // 1px = 1°

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    track.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 120 }));
    track.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 120 }));
    await picker.updateComplete;

    expect(picker.hue).toBe(120);
    cleanup(root);
  });

  test("dragging left decreases hue by delta", async () => {
    const { root, picker } = await newPicker({ value: "#00ff00" }); // hue=120
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360);

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 200 }));
    track.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 80 }));
    await picker.updateComplete;

    expect(picker.hue).toBe(0); // 120 - 120 = 0
    cleanup(root);
  });

  test("hue clamps to 0 at lower bound", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" }); // hue=0
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360);

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100 }));
    track.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: -50 })); // would go to -150°
    await picker.updateComplete;

    expect(picker.hue).toBe(0);
    cleanup(root);
  });

  test("hue clamps to 360 at upper bound", async () => {
    const { root, picker } = await newPicker({ value: "#ff00ff" }); // hue≈300
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360);

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    track.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 500 })); // way past end
    await picker.updateComplete;

    expect(picker.hue).toBe(360);
    cleanup(root);
  });

  test("pointermove fires input event", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360);

    let inputFired = false;
    picker.addEventListener("input", () => {
      inputFired = true;
    });

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    track.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 60 }));
    await picker.updateComplete;

    expect(inputFired).toBe(true);
    cleanup(root);
  });

  test("pointerup fires change event", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const track = mockHueTrack(sr, 360);

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    track.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    track.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 60 }));
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    cleanup(root);
  });

  test("keyboard arrow keys update hue", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" }); // hue=0
    const sr = picker.shadowRoot!;
    const hueSlider = sr.querySelector<HTMLElement>("[part~='hue-slider']")!;

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    hueSlider.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    expect(picker.hue).toBe(1);
    cleanup(root);
  });
});

// ── Alpha ─────────────────────────────────────────────────────────────

describe("alpha", () => {
  test("alpha=false: hue slider present, no alpha input", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    expect(sr.querySelector("[part~='hue-slider']")).toBeTruthy();
    expect(sr.querySelector("[part~='alpha-input']")).toBeNull();
    cleanup(root);
  });

  test("alpha=true: alpha slider rendered", async () => {
    const { root, picker } = await newPicker({ alpha: true });
    const sr = picker.shadowRoot!;
    expect(sr.querySelector("[part~='alpha-slider']")).toBeTruthy();
    cleanup(root);
  });

  test("alpha=true: opacity number input rendered", async () => {
    const { root, picker } = await newPicker({ alpha: true });
    const sr = picker.shadowRoot!;
    expect(sr.querySelector(".opacity-input")).toBeTruthy();
    cleanup(root);
  });

  test("alpha slider drag produces 9-char hex value", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000", alpha: true });
    const sr = picker.shadowRoot!;
    const slider = sr.querySelector<HTMLElement>("[part~='alpha-slider']")!;
    slider.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 28, right: 100, bottom: 28 }) as DOMRect;

    // start at 100%, drag left by 50px → alphaPercent=50
    slider.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 100 }),
    );
    slider.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 50 }));
    await picker.updateComplete;

    expect(picker.value.length).toBe(9);
    expect(picker.value).toMatch(/^#[0-9a-f]{8}$/);
    cleanup(root);
  });

  test("alpha=100 appends ff", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000", alpha: true });
    const sr = picker.shadowRoot!;
    const opacityInput = sr.querySelector<HTMLInputElement>(".opacity-input")!;

    opacityInput.value = "100";
    opacityInput.dispatchEvent(new Event("change", { bubbles: true }));
    await picker.updateComplete;

    expect(picker.value.toLowerCase()).toBe("#ff0000ff");
    cleanup(root);
  });

  test("opacity number input change updates alphaPercent", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000", alpha: true });
    const sr = picker.shadowRoot!;
    const opacityInput = sr.querySelector<HTMLInputElement>(".opacity-input")!;

    opacityInput.value = "75";
    opacityInput.dispatchEvent(new Event("change", { bubbles: true }));
    await picker.updateComplete;

    expect(picker.alphaPercent).toBe(75);
    cleanup(root);
  });
});

// ── Hex input ─────────────────────────────────────────────────────────

describe("hex input", () => {
  test("typing a valid hex and blurring updates the color", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const hexInput = sr.querySelector<HTMLInputElement>(".hex-input")!;

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    hexInput.value = "0000FF";
    hexInput.dispatchEvent(new Event("input", { bubbles: true }));
    hexInput.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    expect(picker.hue).toBe(240);
    cleanup(root);
  });

  test("invalid hex on blur resets input to current value", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const hexInput = sr.querySelector<HTMLInputElement>(".hex-input")!;

    hexInput.value = "ZZZZZZ";
    hexInput.dispatchEvent(new Event("input", { bubbles: true }));
    hexInput.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await picker.updateComplete;

    expect(picker.value).toBe("#ff0000");
    cleanup(root);
  });

  test("Enter key commits hex input", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const hexInput = sr.querySelector<HTMLInputElement>(".hex-input")!;

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    hexInput.value = "00FF00";
    hexInput.dispatchEvent(new Event("input", { bubbles: true }));
    hexInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    expect(picker.value.toLowerCase()).toBe("#00ff00");
    cleanup(root);
  });

  test("hex input always 6 chars regardless of alpha", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000", alpha: true });
    const sr = picker.shadowRoot!;
    const hexInput = sr.querySelector<HTMLInputElement>(".hex-input")!;
    expect(hexInput.getAttribute("maxlength")).toBe("6");
    cleanup(root);
  });
});

// ── Palette presets ───────────────────────────────────────────────────

describe("palette presets", () => {
  test("renders swatches from palette attribute", async () => {
    const { root, picker } = await newPicker({ palette: "#ff0000,#00ff00,#0000ff" });
    const sr = picker.shadowRoot!;
    expect(sr.querySelectorAll(".palette-swatch").length).toBe(3);
    cleanup(root);
  });

  test("clicking a swatch updates the color and fires change", async () => {
    const { root, picker } = await newPicker({
      value: "#ff0000",
      palette: "#0000ff,#00ff00",
    });
    const sr = picker.shadowRoot!;
    const swatch = sr.querySelector<HTMLButtonElement>(".palette-swatch")!;

    let changeFired = false;
    picker.addEventListener("change", () => {
      changeFired = true;
    });

    swatch.click();
    await picker.updateComplete;

    expect(changeFired).toBe(true);
    expect(picker.value.toLowerCase()).toBe("#0000ff");
    cleanup(root);
  });

  test("active swatch has data-selected attribute", async () => {
    const { root, picker } = await newPicker({
      value: "#0000ff",
      palette: "#ff0000,#0000ff",
    });
    const sr = picker.shadowRoot!;
    const swatches = sr.querySelectorAll<HTMLButtonElement>(".palette-swatch");
    expect(swatches[0]!.hasAttribute("data-selected")).toBe(false);
    expect(swatches[1]!.hasAttribute("data-selected")).toBe(true);
    cleanup(root);
  });

  test("no palette section when palette not set", async () => {
    const { root, picker } = await newPicker();
    const sr = picker.shadowRoot!;
    expect(sr.querySelector(".palette")).toBeNull();
    cleanup(root);
  });
});

// ── Disabled state ────────────────────────────────────────────────────

describe("disabled", () => {
  test("hue slider has aria-disabled when disabled=true", async () => {
    const { root, picker } = await newPicker({ disabled: true });
    const sr = picker.shadowRoot!;
    const hueSlider = sr.querySelector<HTMLElement>("[part~='hue-slider']")!;
    expect(hueSlider.getAttribute("aria-disabled")).toBe("true");
    cleanup(root);
  });

  test("hex input disabled when disabled=true", async () => {
    const { root, picker } = await newPicker({ disabled: true });
    const sr = picker.shadowRoot!;
    expect(sr.querySelector<HTMLInputElement>(".hex-input")!.disabled).toBe(true);
    cleanup(root);
  });

  test("palette swatches disabled when disabled=true", async () => {
    const { root, picker } = await newPicker({
      disabled: true,
      palette: "#ff0000,#00ff00",
    });
    const sr = picker.shadowRoot!;
    for (const sw of sr.querySelectorAll<HTMLButtonElement>(".palette-swatch")) {
      expect(sw.disabled).toBe(true);
    }
    cleanup(root);
  });

  test("pointer interaction on field does nothing when disabled", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000", disabled: true });
    const sr = picker.shadowRoot!;
    const field = sr.querySelector<HTMLElement>(".sv-field")!;

    let inputFired = false;
    picker.addEventListener("input", () => {
      inputFired = true;
    });

    field.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await picker.updateComplete;

    expect(inputFired).toBe(false);
    expect(picker.value).toBe("#ff0000");
    cleanup(root);
  });
});

// ── Form integration ──────────────────────────────────────────────────

describe("form integration", () => {
  test("hidden input created when name is set", async () => {
    const { root, picker } = await newPicker({ name: "color", value: "#ff0000" });
    const hidden = picker.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe("color");
    expect(hidden.value).toBe("#ff0000");
    cleanup(root);
  });

  test("hidden input stays in sync after hue change", async () => {
    const { root, picker } = await newPicker({ name: "color", value: "#ff0000" });
    const sr = picker.shadowRoot!;
    const slider = sr.querySelector<HTMLElement>("[part~='hue-slider']")!;
    slider.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 360, height: 28, right: 360, bottom: 28 }) as DOMRect;

    slider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    slider.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 240 }));
    await picker.updateComplete;

    const hidden = picker.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect(hidden.value).toBe(picker.value);
    cleanup(root);
  });
});

// ── HSV ↔ hex round-trip ──────────────────────────────────────────────

describe("color math", () => {
  const cases: Array<{ hex: string; h: number; s: number; v: number }> = [
    { hex: "#ff0000", h: 0, s: 100, v: 100 },
    { hex: "#00ff00", h: 120, s: 100, v: 100 },
    { hex: "#0000ff", h: 240, s: 100, v: 100 },
    { hex: "#ffffff", h: 0, s: 0, v: 100 },
    { hex: "#000000", h: 0, s: 0, v: 0 },
    { hex: "#808080", h: 0, s: 0, v: 50 },
  ];

  for (const { hex, s, v } of cases) {
    test(`${hex} syncs correctly`, async () => {
      const { root, picker } = await newPicker({ value: hex });
      expect(picker.svSat).toBe(s);
      expect(picker.svVal).toBe(v);
      cleanup(root);
    });
  }

  test("setting hue to pure colors round-trips through hex", async () => {
    const { root, picker } = await newPicker({ value: "#ff0000" }); // h=0, s=100, v=100
    const sr = picker.shadowRoot!;
    const slider = sr.querySelector<HTMLElement>("[part~='hue-slider']")!;
    slider.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 360, height: 28, right: 360, bottom: 28 }) as DOMRect;

    // Drag 120px right on a 360px slider = +120°, landing on green
    slider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 0 }));
    slider.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 120 }));
    await picker.updateComplete;

    // h=120, s=100, v=100 → #00ff00
    expect(picker.value.toLowerCase()).toBe("#00ff00");
    cleanup(root);
  });
});

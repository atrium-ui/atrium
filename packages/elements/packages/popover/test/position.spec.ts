import { describe, expect, test } from "bun:test";
import { calculatePosition, type Rect } from "../src/position.js";

const viewport = rect(0, 0, 800, 600);
const floating = { width: 200, height: 100 };

describe("popover positioning", () => {
  test("chooses the side with the most room", () => {
    const position = calculatePosition(rect(300, 500, 100, 40), floating, viewport, [
      "top",
      "bottom",
    ]);

    expect(position).toMatchObject({ placement: "top", x: 250, y: 400 });
  });

  test("uses candidate order when available room is equal", () => {
    const position = calculatePosition(rect(300, 280, 100, 40), floating, viewport, [
      "bottom",
      "top",
    ]);

    expect(position.placement).toBe("bottom");
  });

  test("supports start and end alignment", () => {
    const reference = rect(300, 100, 100, 40);

    expect(
      calculatePosition(reference, floating, viewport, ["bottom-start"]),
    ).toMatchObject({ x: 300, y: 140 });
    expect(
      calculatePosition(reference, floating, viewport, ["bottom-end"]),
    ).toMatchObject({ x: 200, y: 140 });
  });

  test("reverses horizontal start and end in RTL", () => {
    const position = calculatePosition(
      rect(300, 100, 100, 40),
      floating,
      viewport,
      ["bottom-start"],
      "center",
      true,
    );

    expect(position.x).toBe(200);
  });

  test("shifts the cross-axis into the viewport", () => {
    const position = calculatePosition(rect(750, 100, 40, 40), floating, viewport, [
      "bottom",
    ]);

    expect(position.x).toBe(600);
    expect(position.y).toBe(140);
  });

  test("positions an arrow at the reference center", () => {
    const position = calculatePosition(
      rect(300, 100, 100, 40),
      floating,
      viewport,
      ["bottom"],
      "center",
      false,
      { width: 20, height: 20 },
    );

    expect(position.arrow).toEqual({ x: 90 });
  });

  test("supports side placements and vertical arrows", () => {
    const position = calculatePosition(
      rect(700, 250, 40, 40),
      floating,
      viewport,
      ["left"],
      "center",
      false,
      { width: 20, height: 20 },
    );

    expect(position).toMatchObject({ placement: "left", x: 500, y: 220 });
    expect(position.arrow).toEqual({ y: 40 });
  });
});

function rect(left: number, top: number, width: number, height: number): Rect {
  return {
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
  };
}

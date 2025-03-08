import Rand from "rand-seed";
import { expect } from "bun:test";
import type { Vec2 } from "../src";
import type { Track as TrackElement } from "../src/Track";

export function enviroment() {
  globalThis.seed = process.env.TEST_SEED || crypto.randomUUID();
  globalThis.rand = new Rand(globalThis.seed);
  console.info("\nTest run seed:", globalThis.seed, "\n");
}

export function random() {
  return globalThis.rand.next();
}

export function label(str: string) {
  return `${str} [${globalThis.seed}]`;
}

export function press(ele: Element, key: string) {
  ele.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key,
    }),
  );
}

export async function fixElementSizes(ele: Element, width: number, height: number) {
  Object.defineProperty(ele, "offsetWidth", {
    writable: true,
  });
  Object.defineProperty(ele, "offsetHeight", {
    writable: true,
  });

  // @ts-ignore
  ele.offsetWidth = width;
  // @ts-ignore
  ele.offsetHeight = height;
}

export async function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class FakePointerEvent extends PointerEvent {
  constructor(
    type: string,
    public x: number,
    public y: number,
    init?: PointerEventInit,
  ) {
    super(type, {
      button: 0,
      bubbles: true,
      ...init,
    });
  }
}

export async function drag<
  T extends HTMLElement & {
    position: Vec2;
    target?: Vec2;
  },
>(track: T, dist: [number, number], speed: number) {
  const pos = [300, 300] as [number, number];
  const start = [...track.position];
  const step = [
    Math.abs(dist[0]) > 0 ? 10 + random() * speed : 0,
    Math.abs(dist[1]) > 0 ? 10 + random() * speed : 0,
  ] as [number, number];

  console.info("step", step);

  // start moving
  track.dispatchEvent(new FakePointerEvent("pointerdown", ...pos));
  console.info("down");

  await sleep(32);

  expect(track.target).toBeUndefined();

  for (let i = 0; i < 15; i++) {
    pos[0] -= step[0];
    pos[1] -= step[1];

    window.dispatchEvent(new FakePointerEvent("pointermove", ...pos));

    await sleep(16);
  }

  // has moved at all?
  expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();

  window.dispatchEvent(new FakePointerEvent("pointerup", ...pos));
  console.info("up");

  await sleep(16);
}

export async function trackWithChildren(
  itemCount = 10,
  attributes: Record<string, string | boolean | number> = {},
) {
  await import("@sv/elements/track");

  const widths = new Array<number>(itemCount)
    .fill(0)
    .map(() => Math.floor(random() * 500 + 150));

  console.info(widths);

  const div = document.createElement("div");
  const markup = `
    <a-track ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>
      ${widths.map((w) => `<canvas width="${w}" height="800"></canvas>`).join("")}
    </a-track>
  `;
  div.innerHTML = markup;

  const track = div.children[0] as TrackElement;
  fixElementSizes(track, 1200, 800);

  // increase animation speed for testing
  track.transitionTime = 150;

  for (let i = 0; i < itemCount; i++) {
    const child = track.children[i] as HTMLCanvasElement;
    fixElementSizes(
      child,
      Number.parseInt(child.getAttribute("width") || "0"),
      Number.parseInt(child.getAttribute("height") || "0"),
    );
  }

  document.body.append(div);

  // @ts-ignore
  track.format();

  return track;
}

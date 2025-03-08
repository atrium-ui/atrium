import { test, expect } from "bun:test";
import type { MoveEvent } from "../src/Track";
import type { Track as TrackElement } from "../src/Track";
import Rand from "rand-seed";

const seed = process.env.TEST_SEED || crypto.randomUUID();
const rand = new Rand(seed);

function random() {
  return rand.next();
}

console.info("\nTest run seed:", seed, "\n");

const NODE_NAME = "a-track";

test("import track element", async () => {
  const { Track } = await import("@sv/elements/track");
  expect(Track).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct track element", async () => {
  const { Track } = await import("@sv/elements/track");

  // is constructable
  expect(new Track()).toBeInstanceOf(Track);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Track);
});

test("deconstruct track element", async () => {
  const track = await trackWithChildren();
  track.remove();
  // @ts-ignore
  expect(track.animation).toBeUndefined();
});

test("check default traits", async () => {
  const track = await trackWithChildren();
  expect(track.findTrait("pointer")).toBeDefined();
});

test("item count", async () => {
  const track = await trackWithChildren(10);
  expect(track.itemCount).toBe(10);
});

test("custom trait", async () => {
  const track = await trackWithChildren();

  let input = false;
  let update = false;
  let format = false;
  let start = false;
  let stop = false;

  track.addTrait({
    id: "test",

    input() {
      input = true;
    },

    update() {
      update = true;
    },

    stop() {
      stop = true;
    },

    start() {
      start = true;
    },

    format() {
      format = true;
    },
  });

  // @ts-ignore
  track.format();
  track.startAnimate();
  // @ts-ignore Force update tick
  track.updateTick();

  expect(start).toBeTrue();
  expect(input).toBeTrue();
  expect(update).toBeTrue();
  expect(format).toBeTrue();

  track.remove();

  expect(stop).toBeTrue();
});

test("check snap trait", async () => {
  const track = await trackWithChildren();
  track.snap = true;
  await track.updateComplete;
  expect(track.findTrait("snap")).toBeDefined();
});

test("arrow key navigation", async () => {
  const track = await trackWithChildren();
  track.tabIndex = 0;
  track.focus();

  press(track, "ArrowRight");

  await sleep(track.transitionTime + 100);

  expect(document.activeElement).toBe(track);
  expect(track.currentItem).toBe(1);
});

test("move event details", async () => {
  const track = await trackWithChildren();
  track.addEventListener("move", ((e: MoveEvent) => {
    expect(e.detail.direction).toBeDefined();
    expect(e.detail.velocity).toBeDefined();
    expect(e.detail.position).toBeDefined();

    e.preventDefault();
  }) as EventListener);

  // @ts-ignore
  expect(track.canMove()).toBeFalse();
});

test("moveBy", async () => {
  const track = await trackWithChildren();

  track.moveBy(2);

  const positions: Array<number> = [];

  const int = setInterval(() => {
    positions.push(track.currentPosition);
  }, track.transitionTime / 10);

  await sleep(track.transitionTime + 100);

  expect(track.currentItem).toBe(2);

  clearInterval(int);

  expect(positions.length > 5).toBeTrue();
});

test("centered index 1", async () => {
  const track = await trackWithChildren(10, {
    align: "center",
  });

  expect(track.align).toBe("center");

  track.moveTo(1);
  await sleep(track.transitionTime + 100);

  expect(track.currentItem).toBe(1);
  expect(track.currentPosition !== 0).toBeTrue();

  let offset = 0;
  for (let i = 0; i < track.currentItem; i++) {
    // @ts-ignore
    offset += track.itemWidths[i];
  }
  // @ts-ignore
  offset += track.itemWidths[track.currentItem] / 2;

  expect(track.currentPosition).toBe(offset - track.width / 2);
});

test("centered index 0", async () => {
  const track = await trackWithChildren(10, {
    align: "center",
  });

  expect(track.align).toBe("center");

  track.moveTo(0);
  await sleep(track.transitionTime + 100);

  expect(track.currentItem).toBe(0);

  // @ts-ignore
  const offset = track.itemWidths[track.currentItem] / 2;
  expect(track.currentPosition).toBe(offset - track.width / 2);
});

test("snap", async () => {
  const track = await trackWithChildren(10, { snap: true });

  expect(track.snap).toBe(true);

  // @ts-ignore
  const widths = track.itemWidths;

  track.setTarget([widths[0] + widths[1] + 10, 0]);
  await sleep(track.transitionTime + 100);
  track.setTarget(undefined);
  await sleep(track.transitionTime + 100);

  expect(Math.floor(track.currentPosition)).toBeGreaterThanOrEqual(widths[0] + widths[1]);

  expect(track.currentIndex).toBeGreaterThanOrEqual(2);
});

test("drag with snap", async () => {
  const track = await trackWithChildren(10, { snap: true, current: 2 });

  let int: Timer;
  (() => {
    int = setInterval(() => {
      console.info(track.position, track.target);
    }, 16);
  })();

  await sleep(100);
  await drag(track, 500, 100);

  clearInterval(int);
});

class FakePointerEvent extends PointerEvent {
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

async function drag(ele: TrackElement, dist: number, speed: number) {
  const pos = [500, 0] as [number, number];
  const start = [...ele.position];

  ele.dispatchEvent(new FakePointerEvent("pointerdown", ...pos));
  console.info("down");

  await sleep(10);

  const step = 5 + random() * speed;

  for (let i = 0; i < dist; i += step) {
    pos[0] -= step;
    pos[1] -= random();

    window.dispatchEvent(new FakePointerEvent("pointermove", ...pos));

    await sleep(16);
  }

  console.info("pos", ele.position);
  expect(ele.position[0] !== start[0]).toBeTrue();

  window.dispatchEvent(new FakePointerEvent("pointerup", ...pos));
  console.info("up");

  await sleep(ele.transitionTime + 300);

  expect(ele.target).toBeDefined();
  expect(ele.position[0]).toBeCloseTo(ele.target?.[0], -1);
}

// TODO: snap with inertia to the correct position
// TODO: loop

async function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fixElementSizes(ele: Element, width: number, height: number) {
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

async function trackWithChildren(
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
  fixElementSizes(track, 800, 800);

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

function press(ele: Element, key: string) {
  ele.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key,
    }),
  );
}

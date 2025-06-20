import { beforeEach, test, expect, describe } from "bun:test";
import type { MoveEvent, Track } from "../src/Track";
import type { Track as TrackElement } from "../src/Track";
import {
  fixElementSizes,
  label,
  random,
  sleep,
  drag as _drag,
  onFrame,
  press,
  setup,
  pointer,
} from "@sv/test";

beforeEach(() => setup());

async function trackWithChildren(
  itemCount = 10,
  attributes: Record<string, string | boolean | number> = {},
) {
  await import("../src/index.js");

  const widths = new Array<number>(itemCount)
    .fill(0)
    .map(() => Math.floor(random() * 500 + 150));

  console.info("items", widths);

  const div = document.createElement("div");
  const markup = `
    <a-track ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>
      ${widths.map((w) => `<canvas width="${w}" height="800"></canvas>`).join("")}
    </a-track>
  `;
  div.innerHTML = markup;

  const totalSize = widths.reduce((acc, w) => acc + w, 0);
  const track = div.children[0] as TrackElement;
  fixElementSizes(track, random() * (totalSize / 4), random() * 800);

  // increase animation speed for testing
  track.transitionTime = 100;

  for (let i = 0; i < itemCount; i++) {
    const child = track.children[i] as HTMLCanvasElement;
    fixElementSizes(
      child,
      Number.parseInt(child.getAttribute("width") || "0"),
      Number.parseInt(child.getAttribute("height") || "0"),
    );
  }

  document.body.append(div);

  if (track.vertical) {
    track.position.y = random() * track.overflowWidth;
  } else {
    track.position.x = random() * track.overflowWidth;
  }

  // @ts-ignore
  track.updateLayout();
  // @ts-ignore
  track.onFormat();

  console.info(
    "track",
    track.width,
    track.height,
    track.trackWidth,
    track.trackHeight,
    track.position,
  );

  return track;
}

async function drag<
  T extends HTMLElement & {
    position: [number, number];
    target?: [number, number];
  },
>(track: T, dist: [number, number]) {
  const start = [...track.position];
  const ev = await _drag(track, dist);
  // has moved at all?
  expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();
  return ev;
}

function logRun(track: Track) {
  onFrame(() => {
    console.info(">", track.position, track.currentItem, track.velocity, track.target);
  });
}

describe("Track", () => {
  test(label("import track element"), async () => {
    const { Track } = await import("../src/index.js");
    expect(Track).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get("a-track")).toBeDefined();
  });

  test("construct track element", async () => {
    const { Track } = await import("../src/index.js");

    // is constructable
    expect(new Track()).toBeInstanceOf(Track);

    const html = "<a-track></a-track>";
    const ele = document.createElement("div");
    ele.innerHTML = html;

    expect(ele.children[0]).toBeInstanceOf(Track);
  });

  test(label("deconstruct track element"), async () => {
    const track = await trackWithChildren();
    track.remove();
    // @ts-ignore
    expect(track.animation).toBeUndefined();
  });

  test(label("debug is false"), async () => {
    const track = await trackWithChildren();
    expect(track.debug).toBe(false);
  });

  test(label("item count"), async () => {
    const track = await trackWithChildren(10);
    expect(track.itemCount).toBe(10);
  });

  test(label("custom trait"), async () => {
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
    track.onFormat();
    track.startAnimate();

    await sleep(100);

    expect(start).toBeTrue();
    expect(input).toBeTrue();
    expect(update).toBeTrue();
    expect(format).toBeTrue();

    track.remove();

    expect(stop).toBeTrue();
  });

  test(label("check snap trait"), async () => {
    const track = await trackWithChildren();
    track.snap = true;
    await track.updateComplete;
    expect(track.findTrait("snap")).toBeDefined();
  });

  test(label("arrow key navigation"), async () => {
    const track = await trackWithChildren();
    logRun(track);
    track.tabIndex = 0;
    track.focus();

    press(track, "ArrowRight");

    await sleep(track.transitionTime + 100);

    expect(document.activeElement).toBe(track);
    expect(track.currentItem).toBe(1);
  });

  test(label("move event details"), async () => {
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

  test(label("moveBy"), async () => {
    const track = await trackWithChildren(10);
    logRun(track);

    track.moveTo(2);
    await sleep(track.transitionTime + 100);
    expect(track.currentItem).toBe(2);

    track.moveBy(2);
    await sleep(track.transitionTime + 100);

    expect(track.currentItem).toBe(4);
  });

  test(label("centered index 1"), async () => {
    const track = await trackWithChildren(10, {
      align: "center",
    });
    logRun(track);

    expect(track.align).toBe("center");

    track.moveTo(1);
    await sleep(track.transitionTime + 100);

    expect(track.currentItem).toBe(1);
    expect(Math.abs(track.currentPosition)).toBeGreaterThan(0);

    let offset = 0;
    for (let i = 0; i < track.currentItem; i++) {
      offset += track.itemWidths[i];
    }
    offset += track.itemWidths[track.currentItem] / 2;

    expect(track.currentPosition).toBeCloseTo(offset - track.width / 2);
  });

  test(label("centered index 0"), async () => {
    const track = await trackWithChildren(10, {
      align: "center",
    });
    logRun(track);

    expect(track.align).toBe("center");

    track.moveTo(0);
    await sleep(track.transitionTime + 300);

    expect(track.currentItem).toBe(0);

    // @ts-ignore
    const offset = track.itemWidths[track.currentItem] / 2;
    expect(track.currentPosition).toBeCloseTo(offset - track.width / 2);
  });

  test(label("just snap"), async () => {
    const track = await trackWithChildren(10, { snap: true });
    logRun(track);

    expect(track.snap).toBe(true);
    track.setTarget(undefined);
    track.inputForce.x += 100;
    await sleep(track.transitionTime + 100);
    expect(track.target).toBeDefined();
  });

  test(label("drag with snap"), async () => {
    const track = await trackWithChildren(10, { snap: true, current: 2 });
    logRun(track);

    track.moveTo(4, "none");
    await sleep(200);

    console.info(track.position, track.overflowWidth, track.target);

    await drag(track, [200, 0]);
    await sleep(300);

    // target should be set by snap
    if (track.target) {
      expect(track.target).toBeDefined();
      expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
    } else {
      console.warn("out of bounds?");
    }
  });

  test(label("drag with snap negative"), async () => {
    const track = await trackWithChildren(10, { snap: true });
    logRun(track);

    await drag(track, [-20, 0]);
    await sleep(300);

    // target should be set by snap
    if (track.position.x > 0) {
      expect(track.target).toBeDefined();
      expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
    }
  });

  test(label("drag vertical with snap"), async () => {
    const track = await trackWithChildren(10, { snap: true, current: 3, vertical: true });
    logRun(track);

    await drag(track, [0, 100]);
    await sleep(200);

    // target should be set by snap
    expect(track.target).toBeDefined();
    expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
  });

  test(label("stop when grabbing"), async () => {
    const track = await trackWithChildren(10, { snap: true });
    logRun(track);

    track.transitionTime = 1000;
    track.moveTo(8, "ease");
    await sleep(track.transitionTime / 2);

    // grab it bevore transition ends
    track.dispatchEvent(pointer("pointerdown", 0, 0));
    console.info("Grabbed track");

    await sleep();
    const pos = track.position[0];

    // wait
    await sleep(200);
    // pos should not have changed
    expect(track.position[0]).toBe(pos);
  });

  test(label("click without move should not result in a cancled click"), async () => {
    const track = await trackWithChildren(10, { snap: true, align: "center" });

    track.dispatchEvent(pointer("pointerdown", 100, 100));
    console.info("down");

    await sleep();

    const ev = pointer("pointerup", 100, 100);
    track.dispatchEvent(ev);
    console.info("up");

    expect(ev.defaultPrevented).toBe(false);

    track.dispatchEvent(pointer("pointerdown", 100, 100));
    console.info("down");

    await sleep(100);
    window.dispatchEvent(pointer("pointermove", 150, 110));
    await sleep(100);

    const ev2 = pointer("pointerup", 100, 100);
    track.dispatchEvent(ev2);
    console.info("up");

    expect(ev2.defaultPrevented).toBe(true);
  });

  test(label("wheel event works"), async () => {
    const track = await trackWithChildren(10, {});
    logRun(track);
    track.moveTo(8, "none");
    await sleep(200);

    const start = [...track.position];

    const ev = new WheelEvent("wheel", {
      deltaX: -200,
      deltaY: 0,
      cancelable: true,
    });
    console.info("fired");
    track.dispatchEvent(ev);

    await sleep(100);

    expect(ev.defaultPrevented).toBe(true);
    expect(track.position[0]).not.toBe(start[0]);
  });

  // TODO: loop
});

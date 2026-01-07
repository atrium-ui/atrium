import { userEvent } from "@testing-library/user-event";
import { beforeEach, afterEach, test, expect, describe } from "bun:test";
import type { MoveEvent, Track } from "../src/Track.js";
import type { Track as TrackElement } from "../src/Track.js";
import {
  fixElementSizes,
  label,
  random,
  wait,
  onFrame,
  press,
  setup,
  fakePointer,
} from "@sv/test";

describe("Track", () => {
  const { pointer } = userEvent.setup();

  beforeEach(() => {
    setup();

    globalThis.frameHook = onFrame(() => {
      if (process.env.DEBUG) {
        const track = document.querySelector<Track>("a-track");
        console.info(
          "FRAME >",
          track?.position,
          track?.currentItem,
          track?.velocity,
          track?.target,
        );
      }
    });

    return {
      test: true,
    };
  });

  afterEach(() => {
    if (globalThis.frameHook) {
      globalThis.frameHook();
    }
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

  test(label("import track element"), async () => {
    await import("../dist/index.js");

    // is defined in custom element registry
    expect(customElements.get("a-track")).toBeDefined();
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

    await wait(100);

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
    track.tabIndex = 0;
    track.focus();

    press(track, "ArrowRight");

    await wait(track.transitionTime + 100);

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

    track.moveTo(2);
    await wait(track.transitionTime + 100);
    expect(track.currentItem).toBe(2);

    track.moveBy(2);
    await wait(track.transitionTime + 100);

    expect(track.currentItem).toBe(4);
  });

  test(label("centered index 1"), async () => {
    const track = await trackWithChildren(10, {
      align: "center",
    });

    expect(track.align).toBe("center");

    track.moveTo(1);
    await wait(track.transitionTime + 100);

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

    expect(track.align).toBe("center");

    track.moveTo(0);
    await wait(track.transitionTime + 300);

    expect(track.currentItem).toBe(0);

    // @ts-ignore
    const offset = track.itemWidths[track.currentItem] / 2;
    expect(track.currentPosition).toBeCloseTo(offset - track.width / 2);
  });

  test(label("just snap"), async () => {
    const track = await trackWithChildren(10, { snap: true });

    expect(track.snap).toBe(true);
    track.setTarget(undefined);
    track.inputForce.x += 100;
    await wait(track.transitionTime + 100);
    expect(track.target).toBeDefined();
  });

  test(label("drag with snap"), async () => {
    const track = await trackWithChildren(10, { snap: true, current: 2 });

    track.moveTo(4, "none");
    await wait(200);

    console.info(track.position, track.overflowWidth, track.target);

    const start = [...track.position];

    pointer([
      { keys: "[TouchA>]", target: track, coords: { x: 10, y: 10 } },
      { pointerName: "TouchA", target: track, coords: { x: 200, y: 10 } },
      { keys: "[/TouchA]", target: track },
    ]);

    await wait(300);

    // has moved at all?
    expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();

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

    const start = [...track.position];

    pointer([
      { keys: "[TouchA>]", target: track, coords: { x: 10, y: 650 } },
      { pointerName: "TouchA", target: track, coords: { x: 10, y: 10 } },
      { keys: "[/TouchA]", target: track },
    ]);

    await wait(200);

    expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();

    // target should be set by snap
    if (track.position.x > 0) {
      expect(track.target).toBeDefined();
      expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
    }
  });

  test(label("drag with snap vertical"), async () => {
    const track = await trackWithChildren(10, { snap: true, current: 3, vertical: true });

    const start = [...track.position];

    pointer([
      { keys: "[TouchA>]", target: track, coords: { x: 10, y: 650 } },
      { pointerName: "TouchA", target: track, coords: { x: 10, y: 10 } },
      { keys: "[/TouchA]", target: track },
    ]);

    await wait(200);

    expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();

    // target should be set by snap
    expect(track.target).toBeDefined();
    expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
  });

  test(label("stop when grabbing"), async () => {
    const track = await trackWithChildren(10, { snap: true });

    track.transitionTime = 1000;
    track.moveTo(8, "ease");
    await wait(track.transitionTime / 2);

    // grab it bevore transition ends
    track.dispatchEvent(fakePointer("pointerdown", 0, 0));
    console.info("Grabbed track");

    await wait();
    const pos = track.position[0];

    // wait
    await wait(200);
    // pos should not have changed
    expect(track.position[0]).toBe(pos);
  });

  test(label("click without move should not result in a cancled click"), async () => {
    const track = await trackWithChildren(10, { snap: true, align: "center" });

    track.dispatchEvent(fakePointer("pointerdown", 100, 100));
    console.info("down");

    await wait(6);

    const ev = fakePointer("pointerup", 100, 100);
    track.dispatchEvent(ev);
    console.info("up");

    expect(ev.defaultPrevented).toBe(false);

    track.dispatchEvent(fakePointer("pointerdown", 100, 100));
    console.info("down");

    await wait(100);
    window.dispatchEvent(fakePointer("pointermove", 150, 110));
    await wait(100);

    const ev2 = fakePointer("pointerup", 100, 100);
    track.dispatchEvent(ev2);
    console.info("up");

    expect(ev2.defaultPrevented).toBe(true);
  });

  test(label("wheel event works"), async () => {
    const track = await trackWithChildren(10, {});
    track.moveTo(8, "none");
    await wait(200);

    const start = [...track.position];

    const ev = new WheelEvent("wheel", {
      deltaX: -200,
      deltaY: 0,
      cancelable: true,
    });
    console.info("fired");
    track.dispatchEvent(ev);

    await wait(100);

    expect(ev.defaultPrevented).toBe(true);
    expect(track.position[0]).not.toBe(start[0]);
  });

  test(label("itemsInView works"), async () => {
    const track = await trackWithChildren(10, {});
    await wait(200);

    console.info("itemsInView", track.itemsInView);
    await wait(100);

    expect(track.itemsInView).toBeGreaterThan(0);
  });

  test(label("should snap to the end with overflow auto"), async () => {
    const track = await trackWithChildren(10, {
      snap: true,
      width: "800",
    });

    track.moveTo(track.itemCount - 1, "none");
    await wait(200);

    // should be and end of scroll bounds
    expect(track.target).toBeDefined();
    expect(track.position[0]).toBeCloseTo(track.overflowWidth, -2);
  });

  test(label("should snap to the end with overflow auto with interaction"), async () => {
    const track = await trackWithChildren(10, {
      snap: true,
      width: "800",
    });

    track.moveTo(track.itemCount - 1, "none");
    await wait(200);

    // click on the track once to reset target
    track.dispatchEvent(fakePointer("pointerdown", 100, 100));
    console.info("down");
    await wait(100);
    track.dispatchEvent(fakePointer("pointerup", 100, 100));
    console.info("up");
    await wait(200);

    // should be and end of scroll bounds after one click
    expect(track.position[0]).toBeCloseTo(track.overflowWidth, -2);
  });

  test(label("a single item should snap to the start without overflow"), async () => {
    const track = await trackWithChildren(1, { snap: true, width: 800 });

    track.moveTo(0, "none");
    await wait(200);

    expect(track.position[0]).toBeCloseTo(0);
  });

  test(label("snap to second last item works"), async () => {
    const track = await trackWithChildren(6, { snap: true, width: 600 });

    const secondLastItemIndex = track.itemCount - 2;

    track.moveTo(secondLastItemIndex, "none");
    await wait(200);

    const targetPosition = track.getToItemPosition(secondLastItemIndex);

    expect(track.position[0]).toBe(targetPosition[0]);
  });

  test(label("dont loop to aroung without loop enabled"), async () => {
    const track = await trackWithChildren(10, { snap: true, width: 800 });

    expect(track.loop).toBe(false);

    track.moveTo(4, "none");

    track.moveBy(-5, "none");
    await wait(200);

    expect(track.currentIndex).toBe(0);
  });

  test(label("loop with snap"), async () => {
    const track = await trackWithChildren(10, { snap: true, width: 800, loop: true });

    // move to first cloned item
    track.moveTo(11);
    await wait(200);

    console.error(track.position);

    expect(track.currentIndex).toBe(1);

    expect(track.loop).toBe(true);
  });
});

async function trackWithChildren(
  itemCount = 10,
  attributes: Record<string, string | boolean | number> = {},
) {
  await import("../src/index.js");

  // TODO: track width should be an argument to this

  const widths = new Array<number>(itemCount)
    .fill(0)
    .map(() => Math.floor(random() * 500 + 150));

  const totalSize = widths.reduce((acc, w) => acc + w, 0);
  const width = +(attributes.width || 0) || random() * (totalSize / 4);
  const height = +(attributes.height || 0) || random() * 800;

  console.info("items", widths);

  const div = document.createElement("div");
  const markup = `
    <a-track id="track" class="outline-2 outline-red-500 overflow-visible w-[${width}px] h-[${height}px]" ${Object.entries(
      attributes,
    )
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>
      ${widths.map((w) => `<canvas class="bg-white border-2" width="${w}" height="200"></canvas>`).join("")}
    </a-track>
  `;
  div.innerHTML = markup;

  const track = div.children[0] as TrackElement;
  fixElementSizes(track, width, height);

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
    "wxh",
    track.width,
    track.height,
    "track wxh",
    track.trackWidth,
    track.trackHeight,
    "position",
    track.position,
  );
  console.error("\n", track.outerHTML);

  return track;
}

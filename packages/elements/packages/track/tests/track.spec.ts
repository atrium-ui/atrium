import { beforeEach, test, expect, afterEach, describe } from "bun:test";
import type { MoveEvent, Track } from "../src/Track";
import {
  drag,
  enviroment,
  FakePointerEvent,
  label,
  press,
  setup,
  sleep,
  trackWithChildren,
} from "./test-utils";

let int: Timer;
function logRun(track: Track) {
  int = setInterval(() => {
    console.info(track.position, track.velocity, track.target);
  }, 16);
}

window.requestAnimationFrame = (callback: () => void) => {
  const timer = setTimeout(() => callback(Date.now()), 16.6666666667);
  return timer;
};
window.cancelAnimationFrame = (timer: Timer) => {
  clearTimeout(timer);
};

describe("Track", () => {
  enviroment();

  afterEach(() => {
    clearInterval(int);
  });

  beforeEach(() => {
    setup();
  });

  test(label("import track element"), async () => {
    const { Track } = await import("@sv/elements/track");
    expect(Track).toBeDefined();

    // is defined in custom element registry
    expect(customElements.get("a-track")).toBeDefined();
  });

  test("construct track element", async () => {
    const { Track } = await import("@sv/elements/track");

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

  test(label("centered index 1"), async () => {
    const track = await trackWithChildren(10, {
      align: "center",
    });
    logRun(track);

    expect(track.align).toBe("center");

    track.moveTo(1);
    await sleep(300);

    expect(track.currentItem).toBe(1);
    expect(Math.abs(track.currentPosition)).toBeGreaterThan(0);

    let offset = 0;
    for (let i = 0; i < track.currentItem; i++) {
      // @ts-ignore
      offset += track.itemWidths[i];
    }
    // @ts-ignore
    offset += track.itemWidths[track.currentItem] / 2;

    expect(track.currentPosition).toBeCloseTo(offset - track.width / 2);
  });

  test(label("centered index 0"), async () => {
    const track = await trackWithChildren(10, {
      align: "center",
    });

    expect(track.align).toBe("center");

    track.moveTo(0);
    await sleep(track.transitionTime + 100);

    expect(track.currentItem).toBe(0);

    // @ts-ignore
    const offset = track.itemWidths[track.currentItem] / 2;
    expect(track.currentPosition).toBeCloseTo(offset - track.width / 2);
  });

  test(label("just snap"), async () => {
    const track = await trackWithChildren(10, { snap: true });

    expect(track.snap).toBe(true);

    // @ts-ignore
    const widths = track.itemWidths;

    track.setTarget([widths[0] + widths[1] + 10, 0]);
    await sleep(track.transitionTime + 100);
    track.setTarget(undefined);
    await sleep(track.transitionTime + 100);

    expect(Math.floor(track.currentPosition)).toBeGreaterThanOrEqual(
      widths[0] + widths[1],
    );

    expect(track.currentIndex).toBeGreaterThanOrEqual(2);
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
    expect(track.target).toBeDefined();
    expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
  });

  test(label("drag with snap negative"), async () => {
    const track = await trackWithChildren(10, { snap: true, current: 2 });
    logRun(track);

    track.moveTo(6, "linear");
    await sleep(300);

    await drag(track, [-100, 0]);
    await sleep(300);

    // target should be set by snap
    expect(track.target).toBeDefined();
    expect(track.position[0]).toBeCloseTo(track.target?.[0], -2);
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
    track.dispatchEvent(new FakePointerEvent("pointerdown", 0, 0));
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

    track.dispatchEvent(new FakePointerEvent("pointerdown", 100, 100));
    console.info("down");

    await sleep();

    const ev = new FakePointerEvent("pointerup", 100, 100);
    track.dispatchEvent(ev);
    console.info("up");

    expect(ev.defaultPrevented).toBe(false);

    track.dispatchEvent(new FakePointerEvent("pointerdown", 100, 100));
    console.info("down");

    await sleep(100);
    window.dispatchEvent(new FakePointerEvent("pointermove", 150, 110));
    await sleep(100);

    const ev2 = new FakePointerEvent("pointerup", 100, 100);
    track.dispatchEvent(ev2);
    console.info("up");

    expect(ev2.defaultPrevented).toBe(true);
  });

  test(label("wheel event works"), async () => {
    const track = await trackWithChildren(10, {});
    track.moveTo(8, "none");
    await sleep(200);

    const start = [...track.position];

    const ev = new WheelEvent("wheel", {
      deltaX: -200,
      deltaY: 0,
    });
    track.dispatchEvent(ev);
    console.info("fired");

    expect(ev.defaultPrevented).toBe(true);

    await sleep(100);

    expect(track.position[0]).not.toBe(start[0]);
  });

  // TODO: loop
});

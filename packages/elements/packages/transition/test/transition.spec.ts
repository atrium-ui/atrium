import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { FlipLayoutElement } from "../src/index.js";

const NODE_NAME = "a-transition";

interface AnimationCall {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

interface ControlledAnimation {
  animation: Animation;
  reject: (error?: unknown) => void;
  resolve: () => void;
  target: Element;
}

const animationCalls: AnimationCall[] = [];
const controlledAnimations: ControlledAnimation[] = [];
let holdAnimations = false;
const originalAnimate = HTMLElement.prototype.animate;
const originalResizeObserver = globalThis.ResizeObserver;
const originalMutationObserver = globalThis.MutationObserver;
const resizeObserverInstances: ResizeObserverStub[] = [];
const mutationObserverInstances: MutationObserverStub[] = [];

class ResizeObserverStub {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeObserverInstances.push(this);
  }

  observe() {}
  unobserve() {}
  disconnect() {}

  trigger(entries: ResizeObserverEntry[] = [{} as ResizeObserverEntry]) {
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

class MutationObserverStub {
  callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
    mutationObserverInstances.push(this);
  }

  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }

  trigger(records: MutationRecord[] = [{} as MutationRecord]) {
    this.callback(records, this as unknown as MutationObserver);
  }
}

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;
  globalThis.MutationObserver = MutationObserverStub as typeof MutationObserver;

  HTMLElement.prototype.animate = function (
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ) {
    animationCalls.push({
      target: this,
      keyframes: Array.isArray(keyframes) ? keyframes : [],
      options: typeof options === "number" ? { duration: options } : (options ?? {}),
    });

    let resolve = () => {};
    let reject = () => {};
    const finished = holdAnimations
      ? new Promise<void>((res, rej) => {
          resolve = res;
          reject = rej;
        })
      : Promise.resolve();

    const animation = {
      finished,
      cancel() {
        reject(new DOMException("Animation cancelled", "AbortError"));
      },
    } as Animation;

    if (holdAnimations) {
      controlledAnimations.push({ animation, target: this, resolve, reject });
    }

    return animation;
  };
});

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  globalThis.MutationObserver = originalMutationObserver;
  HTMLElement.prototype.animate = originalAnimate;
});

beforeEach(() => {
  animationCalls.length = 0;
  controlledAnimations.length = 0;
  holdAnimations = false;
  resizeObserverInstances.length = 0;
  mutationObserverInstances.length = 0;
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("FlipLayoutElement", () => {
  test("registers the custom element", () => {
    expect(FlipLayoutElement).toBeDefined();
    expect(customElements.get(NODE_NAME)).toBe(FlipLayoutElement);
  });

  test("does not animate on initial baseline capture", async () => {
    const transition = await newTransition(`<div data-key="a">Alpha</div>`);
    const [alpha] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.flip();

    expect(animationCalls.length).toBe(0);
  });

  test("animates moved keyed children", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 100));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    setRect(alpha, childRect(0, 50, 200, 40));
    setRect(beta, childRect(0, 0, 200, 40));

    transition.flip();

    const moveCalls = animationCalls.filter(
      (call) =>
        call.target !== alpha &&
        call.target !== beta &&
        ["Alpha", "Beta"].includes(call.target.textContent ?? ""),
    );

    expect(moveCalls.length).toBe(2);
    expect(moveCalls[0]?.keyframes[0]?.transform).toContain("translate(");
  });

  test("uses computed transition css values for duration and easing", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    transition.style.transitionDuration = "450ms";
    transition.style.transitionTimingFunction = "linear";

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 100));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    setRect(alpha, childRect(0, 50, 200, 40));
    setRect(beta, childRect(0, 0, 200, 40));

    transition.flip();

    const moveCall = animationCalls.find(
      (call) => call.target !== alpha && call.target.textContent === "Alpha",
    );
    expect(moveCall?.options.duration).toBe(450);
    expect(moveCall?.options.easing).toBe("linear");
  });

  test("animates container height when content shrinks", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    beta.remove();

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.flip();

    const hostCall = animationCalls.find((call) => call.target === transition);
    expect(hostCall).toBeDefined();
    expect(hostCall?.keyframes[0]?.height).toBe("90px");
    expect(hostCall?.keyframes[1]?.height).toBe("40px");
    expect(hostCall?.options.fill).toBe("none");
  });

  test("clears temporary host sizing after container animation settles", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    beta.remove();

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.flip();
    await Promise.resolve();
    await Promise.resolve();

    expect(transition.style.height).toBe("");
    expect(transition.style.overflow).toBe("");
  });

  test("does not animate responsive relayout during window resize", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    window.dispatchEvent(new Event("resize"));

    setRect(transition, rect(0, 0, 160, 120));
    setRect(alpha, childRect(0, 0, 160, 55));
    setRect(beta, childRect(0, 65, 160, 55));

    getResizeObserver(transition).trigger();

    expect(animationCalls.length).toBe(0);
  });

  test("includes host padding in the animated host height", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 240, 122));
    setRect(alpha, childRect(20, 16, 200, 40));
    setRect(beta, childRect(20, 66, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    beta.remove();

    setRect(transition, rect(0, 0, 240, 72));
    setRect(alpha, childRect(20, 16, 200, 40));

    transition.flip();

    const hostCall = animationCalls.find((call) => call.target === transition);
    expect(hostCall).toBeDefined();
    expect(hostCall?.keyframes[0]?.height).toBe("106px");
    expect(hostCall?.keyframes[1]?.height).toBe("56px");
  });

  test("animates entering children when animate-enter is enabled", async () => {
    const transition = await newTransition(`<div data-key="a">Alpha</div>`, {
      animateEnter: true,
    });

    const [alpha] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    const entering = document.createElement("div");
    entering.setAttribute("data-key", "b");
    entering.textContent = "Beta";
    transition.appendChild(entering);

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(entering, childRect(0, 50, 200, 40));

    transition.flip();

    const enterCall = animationCalls.find((call) => call.target === entering);
    expect(enterCall).toBeDefined();
    expect(enterCall?.keyframes[0]?.opacity).toBe("0");
    expect(enterCall?.keyframes[1]?.transform).toBe("scale(1)");
  });

  test("does not animate entering children when animate-enter is disabled", async () => {
    const transition = await newTransition(`<div data-key="a">Alpha</div>`);

    const [alpha] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    const entering = document.createElement("div");
    entering.setAttribute("data-key", "b");
    entering.textContent = "Beta";
    transition.appendChild(entering);

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(entering, childRect(0, 50, 200, 40));

    transition.flip();

    const enterCall = animationCalls.find((call) => call.target === entering);
    expect(enterCall).toBeUndefined();
  });

  test("animates when content changes inside a slotted child", async () => {
    const transition = await newTransition(`
      <div data-key="a"><span>Alpha</span></div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];
    const alphaInner = alpha.querySelector("span") as HTMLElement;

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    alphaInner.textContent = "Alpha updated";
    setRect(transition, rect(0, 0, 200, 120));
    setRect(alpha, childRect(0, 0, 200, 70));
    setRect(beta, childRect(0, 80, 200, 40));

    getMutationObserver(transition).trigger();
    await Promise.resolve();

    const alphaCall = animationCalls.find(
      (call) =>
        call.target !== transition &&
        call.target !== alpha &&
        call.target.textContent?.trim() === "Alpha",
    );
    expect(alphaCall).toBeDefined();
    expect(alphaCall?.keyframes[0]?.transform).toContain("translate(");
  });

  test("animates moved children from a detached ghost instead of the live node", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 100));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    setRect(alpha, childRect(0, 50, 200, 40));
    setRect(beta, childRect(0, 0, 200, 40));

    transition.flip();

    const liveMoveCall = animationCalls.find(
      (call) => call.target === alpha || call.target === beta,
    );
    const ghostMoveCall = animationCalls.find(
      (call) =>
        call.target !== alpha &&
        call.target !== beta &&
        call.target.textContent === "Alpha",
    );

    expect(liveMoveCall).toBeUndefined();
    expect(ghostMoveCall).toBeDefined();
  });

  test("uses border-box sizing for detached ghosts so measured rects stay stable", async () => {
    const transition = await newTransition(`<div data-key="a">Alpha</div>`);
    const [alpha] = Array.from(transition.children) as HTMLElement[];

    alpha.style.padding = "12px";
    alpha.style.border = "4px solid black";

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    setRect(alpha, childRect(0, 50, 200, 40));

    transition.flip();

    const ghostMoveCall = animationCalls.find(
      (call) => call.target !== alpha && call.target.textContent === "Alpha",
    );

    expect(ghostMoveCall).toBeDefined();
    expect((ghostMoveCall?.target as HTMLElement).style.boxSizing).toBe("border-box");
    expect((ghostMoveCall?.target as HTMLElement).style.width).toBe("200px");
    expect((ghostMoveCall?.target as HTMLElement).style.height).toBe("40px");
  });

  test("snapshots unscaled geometry while an item is in a scale animation", async () => {
    const transition = await newTransition(`<div data-key="a">Alpha</div>`, {
      animateEnter: true,
    });
    const [alpha] = Array.from(transition.children) as HTMLElement[];

    alpha.style.transform = "scale(0.98)";

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(2, 0.4, 196, 39.2));

    transition.snapshot();

    const snapshot = transition.snapshots.get("a");
    expect(snapshot).toBeDefined();
    expect(snapshot?.rect.width).toBeCloseTo(200, 3);
    expect(snapshot?.rect.height).toBeCloseTo(40, 3);
  });

  test("restores hidden live children before starting a new overlapping flip", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 100));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);
    holdAnimations = true;

    setRect(alpha, childRect(0, 50, 200, 40));
    setRect(beta, childRect(0, 0, 200, 40));
    transition.flip();

    expect(alpha.style.visibility).toBe("hidden");
    expect(beta.style.visibility).toBe("hidden");

    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));
    transition.flip();

    expect(alpha.style.visibility).toBe("hidden");
    expect(beta.style.visibility).toBe("hidden");
    expect(controlledAnimations.length).toBeGreaterThan(0);
    expect(
      controlledAnimations.some(({ target }) => target.textContent === "Alpha"),
    ).toBe(true);

    for (const { resolve } of controlledAnimations.splice(0)) resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(alpha.style.visibility).toBe("");
    expect(beta.style.visibility).toBe("");
  });

  test("does not animate removed keyed children when animate-exit is disabled", async () => {
    const transition = await newTransition(`
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `);

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    beta.remove();

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    transition.flip();

    const exitCall = animationCalls.find(
      (call) =>
        call.target !== alpha &&
        call.target !== beta &&
        call.target.textContent === "Beta",
    );

    expect(exitCall).toBeUndefined();
  });

  test("animates removed keyed children when animate-exit is enabled", async () => {
    const transition = await newTransition(
      `
      <div data-key="a">Alpha</div>
      <div data-key="b">Beta</div>
    `,
      {
        animateExit: true,
      },
    );

    const [alpha, beta] = Array.from(transition.children) as HTMLElement[];

    setRect(transition, rect(0, 0, 200, 90));
    setRect(alpha, childRect(0, 0, 200, 40));
    setRect(beta, childRect(0, 50, 200, 40));

    transition.snapshot();
    enableAnimations(transition);

    beta.remove();

    setRect(transition, rect(0, 0, 200, 40));
    setRect(alpha, childRect(0, 0, 200, 40));

    await new Promise((resolve) => setTimeout(resolve, 20));

    const exitCall = animationCalls.find(
      (call) =>
        call.target !== alpha &&
        call.target !== beta &&
        call.target.textContent === "Beta",
    );

    expect(exitCall).toBeDefined();
    expect(exitCall?.keyframes[0]?.opacity).toBe("1");
    expect(exitCall?.keyframes[0]?.transform).toBe("scale(1)");
    expect(exitCall?.keyframes.at(-1)?.transform).toBe("scale(0.98)");
  });

  test("disconnects cleanly when removed from the document", async () => {
    const host = document.createElement("div");
    host.innerHTML = `<a-transition><div data-key="a">Alpha</div></a-transition>`;
    document.body.appendChild(host);

    const transition = host.querySelector("a-transition") as FlipLayoutElement;
    await transition.updateComplete;

    expect(() => host.remove()).not.toThrow();
  });
});

function enableAnimations(transition: FlipLayoutElement) {
  const internal = transition as FlipLayoutElement & {
    animationsEnabled: boolean;
    hasBaseline: boolean;
  };

  internal.hasBaseline = true;
  internal.animationsEnabled = true;
}

async function newTransition(
  children: string,
  options: { animateEnter?: boolean; animateExit?: boolean } = {},
) {
  const host = document.createElement("div");
  host.innerHTML = `
    <a-transition
      ${options.animateEnter ? "animate-enter" : ""}
      ${options.animateExit ? "animate-exit" : ""}
    >
      ${children}
    </a-transition>
  `;

  document.body.appendChild(host);

  const transition = host.querySelector("a-transition") as FlipLayoutElement;
  await transition.updateComplete;
  (transition as unknown as { onSlotChange: () => void }).onSlotChange();
  return transition;
}

function getResizeObserver(transition: FlipLayoutElement) {
  return transition["resizeObserver"] as unknown as ResizeObserverStub;
}

function getMutationObserver(transition: FlipLayoutElement) {
  return transition["mutationObserver"] as unknown as MutationObserverStub;
}

function rect(x: number, y: number, width: number, height: number) {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
  };
}

function childRect(x: number, y: number, width: number, height: number) {
  return rect(x, y, width, height);
}

function setRect(element: Element, value: ReturnType<typeof rect>) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => value,
  });
}

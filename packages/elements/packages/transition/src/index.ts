import { LitElement, html, css } from "lit";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Snapshot {
  rect: Rect;
  clone: HTMLElement | null;
}

const ignoreError = () => undefined;

/**
 * A flip-layout element animates its slotted children using the FLIP technique
 * whenever their layout changes (reorder, add, remove, resize).
 *
 * @customEvent flip-start - Dispatched before the FLIP animation begins.
 * @customEvent flip-end   - Dispatched after all FLIP animations complete.
 */
export class FlipLayoutElement extends LitElement {
  static override properties = {
    animateEnter: { type: Boolean, attribute: "animate-enter" },
    animateExit: { type: Boolean, attribute: "animate-exit" },
  };

  declare animateEnter: boolean;
  declare animateExit: boolean;

  snapshots = new Map<Element | string, Snapshot>();
  hostSnapshot: Rect | null = null;
  pendingFlip = false;
  hasBaseline = false;
  animationsEnabled = false;
  cancelEnableAnimationsFrame = () => {};
  cancelResizeSettledFrame = () => {};
  suppressAnimationsUntil = 0;
  ignoreObservedChangesUntil = 0;
  runningAnimations = new Set<Animation>();
  animationCleanups = new Set<() => void>();
  pendingAnimationStarts = new Set<() => void>();

  // Arrow fields so they can be passed directly as callbacks without wrapper closures.
  handleObservedChange = () => {
    if (performance.now() < this.ignoreObservedChangesUntil) return;
    if (!this.hasBaseline || performance.now() < this.suppressAnimationsUntil) {
      this.snapshot();
      return;
    }
    this.scheduleFlip();
  };
  mutationObserver = new MutationObserver(this.handleObservedChange);
  resizeObserver = new ResizeObserver(this.handleObservedChange);
  onWindowResize = () => {
    this.suppressAnimationsUntil = performance.now() + 150;
    this.cancelResizeSettledFrame();
    this.cancelResizeSettledFrame = this.afterNextFrame(this.onResizeSettled);
  };
  onResizeSettled = () => {
    this.cancelAnimations();
    this.snapshot();
  };
  onFlipMicrotask = () => {
    this.pendingFlip = false;
    this.flip();
  };
  onFlipEnd = () => {
    this.dispatchEvent(new CustomEvent("flip-end", { bubbles: true }));
  };
  clearHostSizing = () => {
    this.style.height = "";
    this.style.overflow = "";
  };
  onAnimationsEnabled = () => {
    this.snapshot();
    this.animationsEnabled = true;
  };

  get slotElement(): HTMLSlotElement | null {
    return this.shadowRoot?.querySelector("slot") ?? null;
  }

  get assignedElements(): Element[] {
    return this.slotElement?.assignedElements({ flatten: true }) ?? [];
  }

  keyOf(child: Element): Element | string {
    return child.getAttribute("data-key") || child;
  }

  getAnimationOptions(fill: FillMode = "none"): KeyframeAnimationOptions {
    const styles = getComputedStyle(this);
    return {
      duration: this.parseTime(styles.transitionDuration) ?? 300,
      easing: styles.transitionTimingFunction || "ease-in-out",
      fill,
    };
  }

  parseTime(value: string) {
    const trimmed = value.split(",")[0]?.trim() ?? "";
    if (!trimmed) return null;
    if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed);
    if (trimmed.endsWith("s")) return Number.parseFloat(trimmed) * 1000;
    const parsed = Number.parseFloat(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  getHostRect(): Rect {
    const r = this.rect(this.getBoundingClientRect());
    const slotRect = this.slotElement
      ? this.rect(this.slotElement.getBoundingClientRect())
      : null;
    const children = this.assignedElements;
    if (!children.length) return slotRect ?? r;

    const styles = getComputedStyle(this);
    const insetX =
      this.parsePixels(styles.paddingRight) + this.parsePixels(styles.borderRightWidth);
    const insetY =
      this.parsePixels(styles.paddingBottom) + this.parsePixels(styles.borderBottomWidth);
    const originX = slotRect?.x ?? r.x;
    const originY = slotRect?.y ?? r.y;
    const baseWidth = slotRect?.width ?? r.width;

    let maxRight = originX;
    let maxBottom = originY;

    for (const child of children) {
      const childRect = child.getBoundingClientRect();
      maxRight = Math.max(maxRight, childRect.right);
      maxBottom = Math.max(maxBottom, childRect.bottom);
    }

    return {
      ...r,
      width: Math.max(baseWidth, maxRight - originX) + insetX,
      height: maxBottom - originY + insetY,
    };
  }

  parsePixels(value: string) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  // Returns a cancel function that cancels both animation frames.
  afterNextFrame(fn: () => void): () => void {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(fn);
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }

  public snapshot() {
    this.snapshots.clear();
    for (const child of this.assignedElements) {
      this.snapshots.set(this.keyOf(child), {
        rect: this.measureRect(child),
        clone: this.cloneElement(child),
      });
    }
    this.hostSnapshot = this.getHostRect();
    this.hasBaseline = true;
  }

  public scheduleFlip() {
    if (this.pendingFlip) return;
    this.pendingFlip = true;
    queueMicrotask(this.onFlipMicrotask);
  }

  public flip() {
    if (!this.hasBaseline || !this.animationsEnabled) {
      this.snapshot();
      return;
    }

    this.cancelAnimations();

    const currentHostRect = this.getHostRect();
    const current = this.assignedElements;
    const entering: Element[] = [];
    const exiting: Snapshot[] = [];
    const moving: Array<{ el: Element; from: Rect; to: Rect }> = [];

    // Single pass: classify each current element and build key set for exiting detection.
    const currentKeys = new Set<Element | string>();
    for (const el of current) {
      const key = this.keyOf(el);
      currentKeys.add(key);
      const snapshot = this.snapshots.get(key);
      if (!snapshot) {
        entering.push(el);
      } else {
        const to = this.measureRect(el);
        if (this.rectChanged(snapshot.rect, to))
          moving.push({ el, from: snapshot.rect, to });
      }
    }

    for (const [key, snapshot] of this.snapshots) {
      if (!currentKeys.has(key)) exiting.push(snapshot);
    }

    const hostChanged =
      !!this.hostSnapshot && this.rectChanged(this.hostSnapshot, currentHostRect);
    if (!moving.length && !entering.length && !exiting.length && !hostChanged) {
      this.snapshot();
      return;
    }

    this.dispatchEvent(new CustomEvent("flip-start", { bubbles: true }));

    const finished: Promise<unknown>[] = [];
    const opts = this.getAnimationOptions();

    if (hostChanged)
      this.animateHost(this.hostSnapshot!, currentHostRect, finished, opts);

    for (const { el, from, to } of moving) {
      const snapshot = this.snapshots.get(this.keyOf(el));
      this.animateMoveEl(el, from, to, snapshot?.clone ?? null, finished, opts);
    }

    if (this.animateEnter) {
      for (const el of entering) {
        const anim = this.trackAnimation(
          (el as HTMLElement).animate(
            [
              { opacity: "0", transform: "scale(0.98)", transformOrigin: "center" },
              { opacity: "1", transform: "scale(1)", transformOrigin: "center" },
            ],
            opts,
          ),
        );
        finished.push(anim.finished.catch(ignoreError));
      }
    }

    if (this.animateExit) {
      for (const snapshot of exiting) {
        this.animateExitEl(snapshot.rect, snapshot.clone, finished, opts);
      }
    }

    Promise.all(finished).then(this.onFlipEnd);

    this.snapshot();
  }

  // Registers an animation for cancellation tracking only. Callers manage finished promises.
  trackAnimation(anim: Animation) {
    this.runningAnimations.add(anim);
    anim.finished.catch(ignoreError).then(() => this.runningAnimations.delete(anim));
    return anim;
  }

  animateMoveEl(
    el: Element,
    from: Rect,
    to: Rect,
    clone: HTMLElement | null,
    finished: Promise<unknown>[],
    opts: KeyframeAnimationOptions,
  ) {
    const ghost = this.createGhost(clone, from);
    if (!(el instanceof HTMLElement)) return;
    if (!ghost) {
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      const anim = this.trackAnimation(
        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" },
          ],
          opts,
        ),
      );
      finished.push(anim.finished.catch(ignoreError));
      return;
    }

    const previousVisibility = el.style.visibility;
    const cleanup = this.registerCleanup(() => {
      ghost.remove();
      el.style.visibility = previousVisibility;
    });

    el.style.visibility = "hidden";
    document.body.appendChild(ghost);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const anim = this.trackAnimation(
      ghost.animate(
        [{ transform: "translate(0, 0)" }, { transform: `translate(${dx}px, ${dy}px)` }],
        { ...opts, fill: "forwards" },
      ),
    );
    finished.push(anim.finished.catch(ignoreError).then(cleanup));
  }

  animateExitEl(
    from: Rect,
    clone: HTMLElement | null,
    finished: Promise<unknown>[],
    opts: KeyframeAnimationOptions,
  ) {
    const ghost = this.createGhost(clone, from);
    if (!ghost) return;

    const cleanup = this.registerCleanup(() => ghost.remove());
    document.body.appendChild(ghost);
    ghost.style.opacity = "1";
    ghost.style.transform = "scale(1)";
    ghost.style.transformOrigin = "center";

    finished.push(
      new Promise<void>((resolve) => {
        const start = this.afterFrame(() => {
          this.pendingAnimationStarts.delete(cancelStart);
          const anim = this.trackAnimation(
            ghost.animate(
              [
                {
                  opacity: "1",
                  transform: "scale(1)",
                  transformOrigin: "center",
                  offset: 0,
                },
                {
                  opacity: "0",
                  transform: "scale(0.98)",
                  transformOrigin: "center",
                  offset: 1,
                },
              ],
              { ...opts, fill: "forwards" },
            ),
          );
          anim.finished.catch(ignoreError).then(() => {
            // cleanup();
            resolve();
          });
        });

        const cancelStart = () => {
          start();
          this.pendingAnimationStarts.delete(cancelStart);
          // cleanup();
          resolve();
        };

        this.pendingAnimationStarts.add(cancelStart);
      }),
    );
  }

  animateHost(
    from: Rect,
    to: Rect,
    finished: Promise<unknown>[],
    opts: KeyframeAnimationOptions,
  ) {
    this.style.overflow = "hidden";
    this.style.height = `${from.height}px`;

    const anim = this.trackAnimation(
      this.animate([{ height: `${from.height}px` }, { height: `${to.height}px` }], opts),
    );

    this.style.height = `${to.height}px`;
    finished.push(anim.finished.catch(ignoreError).then(this.clearHostSizing));
  }

  public cancelAnimations() {
    for (const cancelStart of this.pendingAnimationStarts) cancelStart();
    this.pendingAnimationStarts.clear();
    for (const anim of this.runningAnimations) anim.cancel();
    this.runningAnimations.clear();
    for (const cleanup of this.animationCleanups) cleanup();
    this.animationCleanups.clear();
  }

  afterFrame(fn: () => void): () => void {
    const id = window.setTimeout(fn, 16);
    return () => clearTimeout(id);
  }

  cloneElement(el: Element) {
    const clone = el.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return null;
    clone.style.visibility = "";
    return clone;
  }

  createGhost(clone: HTMLElement | null, rect: Rect) {
    const ghost = clone?.cloneNode(true);
    if (!(ghost instanceof HTMLElement)) return null;

    ghost.style.position = "fixed";
    ghost.style.top = `${rect.y}px`;
    ghost.style.left = `${rect.x}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.boxSizing = "border-box";
    ghost.style.pointerEvents = "none";
    ghost.style.margin = "0";
    ghost.style.zIndex = "1";
    ghost.style.willChange = "transform, opacity";

    return ghost;
  }

  registerCleanup(cleanup: () => void) {
    let active = true;
    const wrapped = () => {
      if (!active) return;
      active = false;
      this.animationCleanups.delete(wrapped);
      cleanup();
    };

    this.animationCleanups.add(wrapped);
    return wrapped;
  }

  rect(r: DOMRect): Rect {
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }

  measureRect(el: Element): Rect {
    const rect = this.rect(el.getBoundingClientRect());
    if (!(el instanceof HTMLElement)) return rect;

    const transform = getComputedStyle(el).transform;
    if (!transform || transform === "none") return rect;

    const matrix = new DOMMatrixReadOnly(transform);
    const scaleX = Math.hypot(matrix.a, matrix.b) || 1;
    const scaleY = Math.hypot(matrix.c, matrix.d) || 1;
    if (Math.abs(scaleX - 1) < 0.001 && Math.abs(scaleY - 1) < 0.001) return rect;

    const width = rect.width / scaleX;
    const height = rect.height / scaleY;
    return {
      x: rect.x - (width - rect.width) / 2,
      y: rect.y - (height - rect.height) / 2,
      width,
      height,
    };
  }

  rectChanged(a: Rect, b: Rect) {
    return (
      Math.abs(a.x - b.x) > 0.5 ||
      Math.abs(a.y - b.y) > 0.5 ||
      Math.abs(a.width - b.width) > 0.5 ||
      Math.abs(a.height - b.height) > 0.5
    );
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("resize", this.onWindowResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.cancelEnableAnimationsFrame();
    this.cancelResizeSettledFrame();
    window.removeEventListener("resize", this.onWindowResize);
    this.cancelAnimations();
  }

  onSlotChange() {
    if (this.hasBaseline && this.animationsEnabled) {
      this.ignoreObservedChangesUntil = performance.now() + 50;
    }
    this.syncObservedChildren();
    if (!this.hasBaseline || !this.animationsEnabled) {
      this.snapshot();
      return;
    }
    this.scheduleFlip();
  }

  protected firstUpdated() {
    this.syncObservedChildren();
    this.snapshot();
    this.cancelEnableAnimationsFrame = this.afterNextFrame(this.onAnimationsEnabled);
  }

  syncObservedChildren() {
    const children = this.assignedElements;
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    for (const child of children) {
      this.resizeObserver.observe(child);
      this.mutationObserver.observe(child, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  static styles = css`
    :host {
      display: block;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
      transition-duration: 300ms;
      transition-timing-function: ease-in-out;
    }
    slot {
      display: block;
    }
  `;

  render() {
    return html`<slot part="slot" @slotchange=${this.onSlotChange}></slot>`;
  }
}

try {
  customElements.define("a-transition", FlipLayoutElement);
} catch (err) {
  console.warn("a-transition already defined");
}

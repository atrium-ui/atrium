export type Alignment = "start" | "center" | "end";
export type Side = "top" | "bottom" | "left" | "right";
export type Placement = Side | `${Side}-${Alignment}`;

export type Rect = Pick<
  DOMRect,
  "top" | "right" | "bottom" | "left" | "width" | "height"
>;

export type Position = {
  x: number;
  y: number;
  placement: Placement;
  arrow?: { x?: number; y?: number };
};

type PositionOptions = {
  placements: Placement[];
  alignment?: Alignment;
  arrow?: HTMLElement;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function splitPlacement(placement: Placement, fallback: Alignment = "center") {
  const [side, alignment = fallback] = placement.split("-") as [Side, Alignment?];
  return { side, alignment };
}

function coordinates(
  reference: Rect,
  floating: Pick<Rect, "width" | "height">,
  placement: Placement,
  fallbackAlignment: Alignment,
  rtl: boolean,
) {
  const { side, alignment: specifiedAlignment } = splitPlacement(
    placement,
    fallbackAlignment,
  );
  const alignment =
    rtl && specifiedAlignment !== "center"
      ? specifiedAlignment === "start"
        ? "end"
        : "start"
      : specifiedAlignment;

  let x = reference.left + (reference.width - floating.width) / 2;
  let y = reference.top + (reference.height - floating.height) / 2;

  if (side === "top") y = reference.top - floating.height;
  if (side === "bottom") y = reference.bottom;
  if (side === "left") x = reference.left - floating.width;
  if (side === "right") x = reference.right;

  if (side === "top" || side === "bottom") {
    if (alignment === "start") x = reference.left;
    if (alignment === "end") x = reference.right - floating.width;
  } else {
    if (specifiedAlignment === "start") y = reference.top;
    if (specifiedAlignment === "end") y = reference.bottom - floating.height;
  }

  return { x, y, side };
}

function availableSpace(reference: Rect, viewport: Rect, side: Side) {
  if (side === "top") return reference.top - viewport.top;
  if (side === "bottom") return viewport.bottom - reference.bottom;
  if (side === "left") return reference.left - viewport.left;
  return viewport.right - reference.right;
}

function overflow(
  point: { x: number; y: number },
  floating: Pick<Rect, "width" | "height">,
  viewport: Rect,
) {
  return (
    Math.max(viewport.left - point.x, 0) +
    Math.max(point.x + floating.width - viewport.right, 0) +
    Math.max(viewport.top - point.y, 0) +
    Math.max(point.y + floating.height - viewport.bottom, 0)
  );
}

export function calculatePosition(
  reference: Rect,
  floating: Pick<Rect, "width" | "height">,
  viewport: Rect,
  placements: Placement[],
  fallbackAlignment: Alignment = "center",
  rtl = false,
  arrow?: Pick<Rect, "width" | "height">,
): Position {
  const candidates =
    placements.length > 0 ? placements : (["top", "bottom"] as Placement[]);
  const ranked = candidates.map((placement, index) => {
    const point = coordinates(reference, floating, placement, fallbackAlignment, rtl);
    return {
      ...point,
      placement,
      index,
      space: availableSpace(reference, viewport, point.side),
      overflow: overflow(point, floating, viewport),
    };
  });

  ranked.sort(
    (a, b) => b.space - a.space || a.overflow - b.overflow || a.index - b.index,
  );

  const selected = ranked[0];
  if (!selected) throw new Error("At least one popover placement is required");
  let { x, y } = selected;

  // Match Floating UI's default shift behavior: keep the cross-axis in view but
  // leave the chosen side unchanged.
  if (selected.side === "top" || selected.side === "bottom") {
    x = clamp(x, viewport.left, viewport.right - floating.width);
  } else {
    y = clamp(y, viewport.top, viewport.bottom - floating.height);
  }

  let arrowPosition: Position["arrow"];
  if (arrow) {
    if (selected.side === "top" || selected.side === "bottom") {
      arrowPosition = {
        x: clamp(
          reference.left + reference.width / 2 - x - arrow.width / 2,
          0,
          floating.width - arrow.width,
        ),
      };
    } else {
      arrowPosition = {
        y: clamp(
          reference.top + reference.height / 2 - y - arrow.height / 2,
          0,
          floating.height - arrow.height,
        ),
      };
    }
  }

  return { x, y, placement: selected.placement, arrow: arrowPosition };
}

function viewportRect(): Rect {
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? document.documentElement.clientWidth;
  const height = viewport?.height ?? document.documentElement.clientHeight;

  return {
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
  };
}

function overflowAncestors(element: Element) {
  const ancestors = new Set<EventTarget>([window]);
  let parent: Element | null = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    if (
      /(auto|scroll|overlay|hidden|clip)/.test(
        `${style.overflow}${style.overflowX}${style.overflowY}`,
      )
    ) {
      ancestors.add(parent);
    }

    const root = parent.getRootNode();
    parent = parent.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }

  return ancestors;
}

function applyArrowPosition(element: HTMLElement, position: Position) {
  const { side } = splitPlacement(position.placement);
  const { style } = element;
  style.left = position.arrow?.x === undefined ? "" : `${position.arrow.x}px`;
  style.top = position.arrow?.y === undefined ? "" : `${position.arrow.y}px`;
  style.right = "";
  style.bottom = "";

  if (side === "top") style.bottom = "0px";
  if (side === "bottom") style.top = "0px";
  if (side === "left") style.right = "0px";
  if (side === "right") style.left = "0px";
}

function observeReferenceMove(element: Element, update: () => void) {
  if (typeof IntersectionObserver === "undefined") return undefined;

  let observer: IntersectionObserver | undefined;
  const observe = () => {
    observer?.disconnect();
    const rect = element.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    let initialNotification = true;

    observer = new IntersectionObserver(
      () => {
        if (initialNotification) {
          initialNotification = false;
          return;
        }
        update();
        observe();
      },
      {
        rootMargin: `${-rect.top}px ${-(width - rect.right)}px ${-(height - rect.bottom)}px ${-rect.left}px`,
        threshold: [0, 1],
      },
    );
    observer.observe(element);
  };

  observe();
  return () => observer?.disconnect();
}

/** Position a portaled popover and keep it synchronized with its trigger. */
export function observePosition(
  reference: HTMLElement,
  floating: HTMLElement,
  options: PositionOptions,
) {
  const update = () => {
    const referenceRect = reference.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const arrowRect = options.arrow?.getBoundingClientRect();
    const rtl = getComputedStyle(reference).direction === "rtl";
    const position = calculatePosition(
      referenceRect,
      floatingRect,
      viewportRect(),
      options.placements,
      options.alignment,
      rtl,
      arrowRect,
    );

    floating.style.setProperty("--trigger-width", `${reference.offsetWidth}px`);
    floating.style.transform = `translate(${position.x}px, ${position.y}px)`;
    floating.dataset.placement = position.placement;
    if (options.arrow) applyArrowPosition(options.arrow, position);
  };

  const ancestors = new Set([
    ...overflowAncestors(reference),
    ...overflowAncestors(floating),
  ]);
  for (const ancestor of ancestors) {
    ancestor.addEventListener("scroll", update, { passive: true });
  }
  window.addEventListener("resize", update, { passive: true });
  window.visualViewport?.addEventListener("resize", update, { passive: true });
  window.visualViewport?.addEventListener("scroll", update, { passive: true });

  const resizeObserver =
    typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
  resizeObserver?.observe(reference);
  resizeObserver?.observe(floating);

  update();
  const stopObservingMove = observeReferenceMove(reference, update);

  return () => {
    stopObservingMove?.();
    resizeObserver?.disconnect();
    for (const ancestor of ancestors) ancestor.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("scroll", update);
  };
}

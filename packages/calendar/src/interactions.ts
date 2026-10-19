import { icsFileName, toICS } from "./ics.ts";
import { isBanded } from "./layout.ts";
import { type CalendarModel, SNAP_MINUTES } from "./model.ts";
import { type Geometry, type Hit, hitTest, type Location, locate, locateUnit, type Scene } from "./scene.ts";
import { dateOf, dayOf, lastDayOf, minutesOf, shift } from "./time.ts";
import type { CalendarEvent } from "./types.ts";

interface Mods {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

interface Point {
  x: number;
  y: number;
  mods: Mods;
}

type State =
  | { kind: "idle" }
  | { kind: "press"; x: number; y: number; hit: Hit; mods: Mods; touch: boolean }
  | {
      kind: "create";
      allDay: boolean;
      anchor: number;
      start: number;
      end: number;
      frozen: { length: number; offset: number } | null;
    }
  | { kind: "move"; event: CalendarEvent; grab: Location; duplicate: boolean; native: boolean; start: Date; end: Date }
  | { kind: "resize"; event: CalendarEvent; edge: "start" | "end"; vertical: boolean; start: Date; end: Date }
  | { kind: "box"; unit: number; cx: number; add: boolean }
  | { kind: "pan"; x: number; y: number; samples: { t: number; y: number }[]; fling: boolean }
  | { kind: "zoom"; y0: number; zoom0: number; anchor: number }
  | { kind: "pinch"; distance: number; zoom0: number; mid: { x: number; y: number } }
  | { kind: "strip"; range: [number, number] };

export interface PointerView {
  geo(): Geometry;
  scene(): Scene;
  canvas: HTMLCanvasElement;
  dragImage: HTMLElement;
}

const DRAG_DISTANCE = 4;
const TOUCH_SLOP = 8;
const LONG_PRESS_MS = 450;
const AUTOSCROLL_EDGE = 32;
const AUTOSCROLL_SPEED = 14;
const DAY = 1440;

const snap = (minutes: number) => Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
const absolute = (date: Date) => dayOf(date) * DAY + minutesOf(date);
const fromAbsolute = (minutes: number) => {
  const day = Math.floor(minutes / DAY);
  return dateOf(day, minutes - day * DAY);
};
const modsOf = (e: MouseEvent): Mods => ({ ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey, alt: e.altKey });
const noMods: Mods = { ctrl: false, shift: false, alt: false };

/**
 * Turns pointer, touch and drag input into view changes, previews and requests to the host.
 * Mouse moves of events use native drag and drop so an event can be dragged out as a file.
 */
export class PointerController {
  state: State = { kind: "idle" };
  last: Point | null = null;
  touches = new Map<number, { x: number; y: number }>();
  longPress: ReturnType<typeof setTimeout> | undefined;
  cursor = "default";
  viewKey = "";

  constructor(
    readonly model: CalendarModel,
    readonly view: PointerView,
  ) {}

  get active() {
    const kind = this.state.kind;
    return kind === "create" || kind === "move" || kind === "resize" || kind === "box";
  }

  local(e: MouseEvent) {
    const rect = this.view.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // Pointer events

  down(e: PointerEvent) {
    this.model.stopMotion();
    const { x, y } = this.local(e);
    if (e.pointerType === "touch") return this.touchDown(e, x, y);
    if (this.state.kind !== "idle") return;
    const mods = modsOf(e);
    this.last = { x, y, mods };
    if (e.button === 1) {
      e.preventDefault();
      this.capture(e);
      this.state = { kind: "pan", x, y, samples: [], fling: false };
      return;
    }
    if (e.button !== 0) return;
    const hit = hitTest(this.model, this.view.scene(), x, y, !mods.alt);
    if (hit.kind === "strip") {
      this.capture(e);
      this.state = { kind: "strip", range: this.view.scene().strip };
      this.strip(y);
      return;
    }
    if (hit.kind === "gutter" || (mods.ctrl && mods.alt)) {
      this.capture(e);
      this.state = { kind: "zoom", y0: y, zoom0: this.model.zoom, anchor: y };
      return;
    }
    if (hit.kind === "event" && !hit.edge && !mods.ctrl) this.view.canvas.draggable = true;
    else this.capture(e);
    this.state = { kind: "press", x, y, hit, mods, touch: false };
  }

  move(e: PointerEvent) {
    const { x, y } = this.local(e);
    if (e.pointerType === "touch") return this.touchMove(e, x, y);
    const mods = modsOf(e);
    this.last = { x, y, mods };
    this.track(x, y);
    const s = this.state;
    if (s.kind === "idle") return this.hover(x, y, mods);
    if (s.kind === "press") {
      if (Math.hypot(x - s.x, y - s.y) > DRAG_DISTANCE) this.begin(s);
      return;
    }
    if (s.kind === "pan") {
      this.model.scrollBy(s.x - x, s.y - y);
      s.x = x;
      s.y = y;
      return;
    }
    if (s.kind === "zoom") return this.model.zoomAt(s.zoom0 * Math.exp((s.y0 - y) * 0.01), s.anchor);
    if (s.kind === "strip") return this.strip(y);
    this.update();
  }

  up(e: PointerEvent) {
    if (e.pointerType === "touch") return this.touchUp(e);
    this.finish();
  }

  /** Native drag start cancels the pointer; that drag is handled through the drag events. */
  pointerCancel(e: PointerEvent) {
    if (e.pointerType === "touch") {
      this.touches.delete(e.pointerId);
      if (!this.touches.size) this.reset();
      return;
    }
    if (this.view.canvas.draggable || (this.state.kind === "move" && this.state.native)) return;
    this.reset();
  }

  leave() {
    if (this.state.kind !== "idle") return;
    this.model.setHover(null);
    this.model.setPointer(null);
  }

  /** Re-evaluates the interaction for a changed modifier key, e.g. Shift while creating. */
  modifiers(e: KeyboardEvent) {
    if (!this.last) return;
    this.last = { ...this.last, mods: modsOf(e) };
    if (this.active) this.update();
  }

  capture(e: PointerEvent) {
    this.view.canvas.setPointerCapture(e.pointerId);
  }

  track(x: number, y: number) {
    const loc = locate(this.model, this.view.geo(), x, y);
    this.model.setPointer(loc ? { day: loc.day, minutes: loc.area === "time" ? loc.minutes : null } : null);
  }

  hover(x: number, y: number, mods: Mods) {
    const hit = hitTest(this.model, this.view.scene(), x, y, !mods.alt);
    this.model.setHover(hit.kind === "event" ? hit.box.event.id : null);
    this.cursor =
      hit.kind === "event"
        ? hit.edge
          ? hit.box.area === "time"
            ? "ns-resize"
            : "ew-resize"
          : this.model.canEdit(hit.box.event)
            ? "grab"
            : "pointer"
        : hit.kind === "more" || hit.kind === "strip"
          ? "pointer"
          : hit.kind === "gutter"
            ? "ns-resize"
            : "default";
  }

  strip(y: number) {
    if (this.state.kind !== "strip") return;
    const [u0, u1] = this.state.range;
    this.model.centerOn(u0 + (y / this.view.geo().height) * (u1 - u0));
  }

  // Interactions

  /** Turns a press into a drag once the pointer moved far enough. */
  begin(press: Extract<State, { kind: "press" }>) {
    const { hit, mods } = press;
    const model = this.model;
    if (hit.kind === "event") {
      const event = hit.box.event;
      if (hit.edge) {
        this.state = { kind: "resize", event, edge: hit.edge, vertical: hit.box.area === "time", start: event.start, end: event.end };
      } else if (press.touch && model.canEdit(event)) {
        const grab = locate(model, this.view.geo(), press.x, press.y);
        if (!grab) return this.reset();
        this.state = { kind: "move", event, grab, duplicate: false, native: false, start: event.start, end: event.end };
      }
      // Mouse moves are handed to native drag and drop.
      return;
    }
    if (mods.ctrl) {
      const geo = this.view.geo();
      this.state = {
        kind: "box",
        unit: model.rows.pxToUnit(geo.scrollTop + press.y),
        cx: press.x - geo.colsX,
        add: mods.shift,
      };
      return this.update();
    }
    const loc = locate(model, this.view.geo(), press.x, press.y);
    if (!loc) return this.reset();
    if (!model.canCreate) {
      model.notify(model.strings.noWritableCalendar);
      return this.reset();
    }
    const allDay = loc.area !== "time";
    const anchor = allDay ? loc.day : snap(loc.day * DAY + loc.minutes);
    this.state = { kind: "create", allDay, anchor, start: anchor, end: anchor, frozen: null };
    this.update();
  }

  /** Recomputes the running interaction from the last pointer position. */
  update() {
    const s = this.state;
    const point = this.last;
    if (!point) return;
    const model = this.model;
    const geo = this.view.geo();
    if (s.kind === "box") {
      const y0 = model.rows.unitToPx(s.unit) - geo.scrollTop;
      const x0 = s.cx + geo.colsX;
      const rect = { x: Math.min(x0, point.x), y: Math.min(y0, point.y), w: Math.abs(point.x - x0), h: Math.abs(point.y - y0) };
      return model.setPreview(null, null, rect);
    }
    const loc = locate(model, geo, point.x, point.y);
    if (!loc) return;
    if (s.kind === "create") return this.updateCreate(s, loc, point.mods);
    if (s.kind === "move") return this.updateMove(s, loc);
    if (s.kind === "resize") return this.updateResize(s, loc);
  }

  updateCreate(s: Extract<State, { kind: "create" }>, loc: Location, mods: Mods) {
    const model = this.model;
    const value = s.allDay ? loc.day : snap(loc.day * DAY + loc.minutes);
    if (mods.shift) {
      s.frozen ??= { length: s.end - s.start, offset: value - s.start };
      s.start = value - s.frozen.offset;
      s.end = s.start + s.frozen.length;
    } else {
      if (s.frozen) {
        s.anchor = Math.abs(value - s.start) < Math.abs(value - s.end) ? s.end : s.start;
        s.frozen = null;
      }
      s.start = Math.min(s.anchor, value);
      s.end = Math.max(s.anchor, value);
      if (!s.allDay && s.end - s.start < SNAP_MINUTES) {
        if (value < s.anchor) s.start = s.end - SNAP_MINUTES;
        else s.end = s.start + SNAP_MINUTES;
      }
    }
    const start = s.allDay ? dateOf(s.start) : fromAbsolute(s.start);
    const end = s.allDay ? dateOf(s.end + 1) : fromAbsolute(s.end);
    const label = s.allDay
      ? s.start === s.end
        ? model.formats.dayShort(start)
        : model.formats.dayRange(start, dateOf(s.end))
      : model.formats.timeRange(start, end);
    const event: CalendarEvent = { id: "", calendarId: model.activeCalendar, title: "", start, end, allDay: s.allDay };
    model.setPreview({ event, style: "create", label, laneOf: null });
  }

  updateMove(s: Extract<State, { kind: "move" }>, loc: Location) {
    const { event, grab } = s;
    if (isBanded(event) || loc.area !== "time" || grab.area !== "time") {
      const days = loc.day - grab.day;
      s.start = shift(event.start, days);
      s.end = shift(event.end, days);
    } else {
      const moved = loc.day * DAY + loc.minutes - (grab.day * DAY + grab.minutes);
      const delta = snap(minutesOf(event.start) + moved) - minutesOf(event.start);
      s.start = shift(event.start, 0, delta);
      s.end = shift(event.end, 0, delta);
    }
    const editable = this.model.canEdit(event);
    if (!editable && !s.duplicate) return this.model.setPreview(null);
    this.model.setPreview(
      {
        event: { ...event, start: s.start, end: s.end },
        style: s.duplicate ? "copy" : "ghost",
        label: this.model.formats.timeRange(s.start, s.end),
        laneOf: event.id,
      },
      s.duplicate ? null : event.id,
    );
  }

  updateResize(s: Extract<State, { kind: "resize" }>, loc: Location) {
    const { event } = s;
    const min = SNAP_MINUTES * 60_000;
    if (s.vertical) {
      const minutes = snap(loc.day * DAY + loc.minutes);
      if (s.edge === "start") s.start = fromAbsolute(Math.min(minutes, absolute(event.end) - SNAP_MINUTES));
      else s.end = fromAbsolute(Math.max(minutes, absolute(event.start) + SNAP_MINUTES));
    } else if (event.allDay) {
      if (s.edge === "start") s.start = dateOf(Math.min(loc.day, lastDayOf(event)));
      else s.end = dateOf(Math.max(loc.day, dayOf(event.start)) + 1);
    } else if (s.edge === "start") {
      const start = shift(event.start, loc.day - dayOf(event.start));
      s.start = start.getTime() <= event.end.getTime() - min ? start : new Date(event.end.getTime() - min);
    } else {
      const end = shift(event.end, loc.day - lastDayOf(event));
      s.end = end.getTime() >= event.start.getTime() + min ? end : new Date(event.start.getTime() + min);
    }
    this.model.setPreview(
      {
        event: { ...event, start: s.start, end: s.end },
        style: "live",
        label: this.model.formats.timeRange(s.start, s.end),
        laneOf: event.id,
      },
      event.id,
    );
  }

  /** Completes the current gesture. */
  finish() {
    const s = this.state;
    const model = this.model;
    this.reset();
    if (s.kind === "press") return this.click(s);
    if (s.kind === "pan" && s.fling) return this.fling(s.samples);
    if (s.kind === "create") {
      if (s.allDay) model.create(dateOf(s.start), dateOf(s.end + 1), true);
      else model.create(fromAbsolute(s.start), fromAbsolute(s.end), false);
      return;
    }
    if (s.kind === "move") return this.commitMove(s);
    if (s.kind === "resize") {
      if (s.start.getTime() !== s.event.start.getTime() || s.end.getTime() !== s.event.end.getTime()) {
        model.change(s.event.id, { start: s.start, end: s.end });
      }
      return;
    }
    if (s.kind === "box" && this.last) {
      const geo = this.view.geo();
      const a = locateUnit(model, geo, s.unit, s.cx);
      const b = locate(model, geo, this.last.x, this.last.y);
      if (!a || !b) return;
      const minutes =
        a.area === "time" && b.area === "time"
          ? ([snap(Math.min(a.minutes, b.minutes)), snap(Math.max(a.minutes, b.minutes))] as [number, number])
          : null;
      model.boxSelect(
        [Math.min(a.week, b.week), Math.max(a.week, b.week)],
        [Math.min(a.col, b.col), Math.max(a.col, b.col)],
        minutes,
        s.add,
      );
    }
  }

  commitMove(s: Extract<State, { kind: "move" }>) {
    const { event } = s;
    if (s.duplicate) {
      if (!this.model.canCreate) return this.model.notify(this.model.strings.noWritableCalendar);
      return this.model.create(s.start, s.end, event.allDay, event.id);
    }
    if (!this.model.canEdit(event)) return;
    if (s.start.getTime() === event.start.getTime()) return;
    this.model.change(event.id, { start: s.start, end: s.end });
  }

  click(press: Extract<State, { kind: "press" }>) {
    const model = this.model;
    const { hit } = press;
    if (hit.kind === "event") {
      const id = hit.box.event.id;
      if (press.mods.ctrl) return model.toggleSelection(id);
      model.setSelection([id]);
      model.open(id);
      model.emit("event-click", { id });
      return;
    }
    if (hit.kind === "more") return model.zoomToWeek(hit.more.week);
    model.close();
    model.setSelection([]);
  }

  /** Esc. Returns false when there was nothing to cancel. */
  cancel(): boolean {
    const s = this.state;
    if (!this.active) return false;
    this.reset();
    const strings = this.model.strings;
    if (s.kind === "create") this.model.notify(strings.creationCancelled);
    if (s.kind === "move") this.model.notify(strings.moveCancelled);
    if (s.kind === "resize") this.model.notify(strings.resizeCancelled);
    return true;
  }

  reset() {
    clearTimeout(this.longPress);
    this.state = { kind: "idle" };
    this.view.canvas.draggable = false;
    if (this.model.preview || this.model.hiddenId || this.model.selectionRect) this.model.setPreview(null);
  }

  /** Per frame: scrolls while dragging near the top or bottom edge. Returns whether it scrolled. */
  frame(): boolean {
    if (!this.active || !this.last) return false;
    const height = this.view.geo().height;
    const y = this.last.y;
    const speed =
      y < AUTOSCROLL_EDGE
        ? -((AUTOSCROLL_EDGE - y) / AUTOSCROLL_EDGE) * AUTOSCROLL_SPEED
        : y > height - AUTOSCROLL_EDGE
          ? ((y - height + AUTOSCROLL_EDGE) / AUTOSCROLL_EDGE) * AUTOSCROLL_SPEED
          : 0;
    if (!speed) return false;
    this.model.scrollBy(0, Math.max(-AUTOSCROLL_SPEED, Math.min(AUTOSCROLL_SPEED, speed)));
    return true;
  }

  /** Per frame: keeps the preview under the pointer while the view scrolls or zooms underneath it. */
  reconcile() {
    const key = `${this.model.center}|${this.model.zoom}|${this.model.scrollX}`;
    if (key === this.viewKey) return;
    this.viewKey = key;
    if (this.active) this.update();
  }

  // Native drag and drop of events

  dragStart(e: DragEvent) {
    const s = this.state;
    const transfer = e.dataTransfer;
    if (s.kind !== "press" || s.hit.kind !== "event" || !transfer) {
      e.preventDefault();
      return;
    }
    const event = s.hit.box.event;
    const ics = toICS([event]);
    transfer.setData("text/calendar", ics);
    transfer.setData("text/plain", ics);
    transfer.setData("DownloadURL", `text/calendar:${icsFileName(event)}:data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`);
    transfer.effectAllowed = "copyMove";
    this.view.dragImage.textContent = event.title || this.model.strings.untitled;
    transfer.setDragImage(this.view.dragImage, 12, 12);
    const grab = locate(this.model, this.view.geo(), s.x, s.y);
    if (!grab) {
      e.preventDefault();
      return this.reset();
    }
    this.state = { kind: "move", event, grab, duplicate: false, native: true, start: event.start, end: event.end };
    this.model.setHover(null);
  }

  /** Returns true when the drag is one of our own event moves. */
  dragOver(e: DragEvent): boolean {
    const s = this.state;
    if (s.kind !== "move" || !s.native) return false;
    e.preventDefault();
    const { x, y } = this.local(e);
    this.last = { x, y, mods: modsOf(e) };
    s.duplicate = e.altKey || e.metaKey;
    const editable = this.model.canEdit(s.event);
    if (e.dataTransfer) e.dataTransfer.dropEffect = s.duplicate ? "copy" : editable ? "move" : "none";
    this.update();
    return true;
  }

  dragLeave() {
    if (this.state.kind !== "move" || !this.state.native) return;
    this.last = null;
    this.model.setPreview(null);
  }

  drop(e: DragEvent): boolean {
    const s = this.state;
    if (s.kind !== "move" || !s.native) return false;
    e.preventDefault();
    this.reset();
    this.commitMove(s);
    return true;
  }

  dragEnd() {
    if (this.state.kind === "move" || this.state.kind === "press") this.reset();
    this.view.canvas.draggable = false;
  }

  // Touch: one finger pans, a long press starts the same interactions as the mouse, two fingers pinch

  touchDown(e: PointerEvent, x: number, y: number) {
    this.capture(e);
    this.touches.set(e.pointerId, { x, y });
    if (this.touches.size === 1) {
      const hit = hitTest(this.model, this.view.scene(), x, y, true);
      const press: State = { kind: "press", x, y, hit, mods: noMods, touch: true };
      this.state = press;
      this.last = { x, y, mods: noMods };
      if (hit.kind === "strip") {
        this.state = { kind: "strip", range: this.view.scene().strip };
        return this.strip(y);
      }
      this.longPress = setTimeout(() => {
        if (this.state !== press) return;
        navigator.vibrate?.(10);
        this.begin(press);
      }, LONG_PRESS_MS);
      return;
    }
    if (this.touches.size === 2) {
      this.reset();
      const [a, b] = [...this.touches.values()] as [{ x: number; y: number }, { x: number; y: number }];
      this.state = {
        kind: "pinch",
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoom0: this.model.zoom,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
    }
  }

  touchMove(e: PointerEvent, x: number, y: number) {
    if (!this.touches.has(e.pointerId)) return;
    this.touches.set(e.pointerId, { x, y });
    const s = this.state;
    if (s.kind === "pinch") {
      const [a, b] = [...this.touches.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this.model.zoomAt((s.zoom0 * s.distance) / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), mid.y);
      this.model.scrollBy(s.mid.x - mid.x, s.mid.y - mid.y);
      s.mid = mid;
      return;
    }
    this.last = { x, y, mods: noMods };
    if (s.kind === "press") {
      if (Math.hypot(x - s.x, y - s.y) <= TOUCH_SLOP) return;
      clearTimeout(this.longPress);
      this.state = { kind: "pan", x: s.x, y: s.y, samples: [], fling: true };
    }
    const pan = this.state;
    if (pan.kind === "pan") {
      this.model.scrollBy(pan.x - x, pan.y - y);
      pan.x = x;
      pan.y = y;
      const t = performance.now();
      pan.samples = [...pan.samples.filter((sample) => t - sample.t < 100), { t, y }];
      return;
    }
    if (pan.kind === "strip") return this.strip(y);
    this.update();
  }

  touchUp(e: PointerEvent) {
    this.touches.delete(e.pointerId);
    const s = this.state;
    if (s.kind === "pinch") {
      const rest = [...this.touches.values()][0];
      this.state = rest ? { kind: "pan", x: rest.x, y: rest.y, samples: [], fling: true } : { kind: "idle" };
      return;
    }
    if (!this.touches.size) this.finish();
  }

  fling(samples: { t: number; y: number }[]) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (!first || !last || last.t - first.t < 10) return;
    this.model.fling(-(last.y - first.y) / (last.t - first.t));
  }
}

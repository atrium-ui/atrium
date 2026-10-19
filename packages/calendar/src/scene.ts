import { isBanded, type Lanes, layoutWeek } from "./layout.ts";
import type { CalendarModel } from "./model.ts";
import { clamp, dateOf, dayOf, isWeekend, lastDayOf, minutesOf, weekdayOf, weekOf, weekStart } from "./time.ts";
import type { CalendarEvent } from "./types.ts";

/** Screen geometry of the calendar body for one frame. */
export interface Geometry {
  width: number;
  height: number;
  gutter: number;
  strip: number;
  colWidth: number;
  /** Screen x of the first day column. */
  colsX: number;
  scrollTop: number;
  expandAt: number;
  /** Root font size in px. */
  rem: number;
}

export type Area = "band" | "time" | "stack";

export interface SceneDay {
  day: number;
  col: number;
  x: number;
  weekday: number;
  today: boolean;
  weekend: boolean;
  /** Outside of the date range, nothing can be placed here. */
  outside: boolean;
}

export interface SceneRow {
  index: number;
  top: number;
  height: number;
  /** null for a filter gap. */
  week: number | null;
  gapWeeks: number;
  /** First day of the week. */
  start: number;
  expanded: boolean;
  timeTop: number;
  timeHeight: number;
  laneTop: number;
  laneHeight: number;
  lanesShown: number;
  /** Bottom of the strip with the day numbers: the end of the all-day band, or of a collapsed row. */
  numbersBottom: number;
  /** Opacity of the day numbers, they fade out instead of shrinking in short rows. */
  numberAlpha: number;
  days: SceneDay[];
}

export interface EventBox {
  event: CalendarEvent;
  x: number;
  y: number;
  w: number;
  h: number;
  area: Area;
  isStart: boolean;
  isEnd: boolean;
  /** Carries the title. */
  label: boolean;
}

export interface MoreBox {
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  week: number;
}

export interface Scene {
  geo: Geometry;
  firstDay: number;
  today: number;
  nowMinutes: number;
  rows: SceneRow[];
  boxes: EventBox[];
  more: MoreBox[];
  preview: EventBox[];
  visible: Set<string>;
  /** Unit range shown by the overview strip. */
  strip: [number, number];
}

export interface Location {
  week: number;
  col: number;
  day: number;
  area: Area;
  minutes: number;
}

export type Hit =
  | { kind: "event"; box: EventBox; edge: "start" | "end" | null }
  | { kind: "more"; more: MoreBox }
  | { kind: "gutter" }
  | { kind: "strip" }
  | { kind: "empty"; loc: Location | null };

const PAD = 2;
const MIN_LANE = 4;
const EDGE = 6;

// Sizes of text and the space that holds it are in rem, so they follow the user's font size.
const MAX_LANE = 1.125;
export const DAY_NUMBER_SIZE = 0.75;
export const MONTH_HEADING_SIZE = 1;
/** Strip below the events of a week that holds its day numbers, right above the days' time area. */
export const DAY_NUMBERS = DAY_NUMBER_SIZE + 0.75;
/** Strip above the events of a week that starts a month, it holds the month heading. */
export const MONTH_HEADER = MONTH_HEADING_SIZE + 1;

/** Height in px of an all-day band with `lanes` lanes; an empty band keeps one lane to create events in. */
export function bandHeight(lanes: number, monthStart: boolean, rem: number) {
  return ((monthStart ? MONTH_HEADER : 0) + Math.max(1, lanes) * MAX_LANE + DAY_NUMBERS) * rem + 2 * PAD;
}

/** The week starting on `firstDay` contains the first day of a month. */
export function startsMonth(firstDay: number) {
  return Array.from({ length: 7 }, (_, col) => dateOf(firstDay + col).getDate()).includes(1);
}

/** Text never scales with the zoom: it fades out between 6px and its full `size` of available `space`. */
export function textFade(space: number, size: number) {
  return clamp((space - 6) / (size - 6), 0, 1);
}

export function buildScene(model: CalendarModel, geo: Geometry, now: Date): Scene {
  const rows = model.rows;
  const scene: Scene = {
    geo,
    firstDay: model.firstDay,
    today: dayOf(now),
    nowMinutes: minutesOf(now),
    rows: [],
    boxes: [],
    more: [],
    preview: [],
    visible: new Set(),
    strip: [0, 1],
  };
  const top = rows.pxToUnit(geo.scrollTop);
  const bottom = rows.pxToUnit(geo.scrollTop + geo.height);
  const first = Math.max(rows.first, Math.floor(top));
  const end = Math.min(rows.end, Math.ceil(bottom));
  for (let i = first; i < end; i++) {
    const row = rows.row(i);
    const top = rows.unitToPx(i) - geo.scrollTop;
    if (row.kind === "gap") {
      const sceneRow = rowGeometry(scene, i, top, rows.heightOf(i), 0, false);
      sceneRow.gapWeeks = row.weeks;
      scene.rows.push(sceneRow);
      continue;
    }
    const start = weekStart(row.week, model.firstDay);
    const sceneRow = rowGeometry(scene, i, top, rows.heightOf(i), model.bandHeight(row.week), startsMonth(start));
    sceneRow.week = row.week;
    sceneRow.start = start;
    sceneRow.days = Array.from({ length: 7 }, (_, col) => {
      const day = sceneRow.start + col;
      return {
        day,
        col,
        x: geo.colsX + col * geo.colWidth,
        weekday: weekdayOf(day),
        today: day === scene.today,
        weekend: isWeekend(day),
        outside: !model.inRange(day),
      };
    });
    scene.rows.push(sceneRow);
    addEvents(model, scene, sceneRow);
  }

  if (model.preview) addPreview(model, scene, model.preview.event, model.preview.laneOf);

  if (rows.items) scene.strip = [0, Math.max(1, rows.items.length)];
  else {
    const weeks = model.derived.weeks;
    const [firstWeek, endWeek] = model.weekBounds;
    scene.strip = [
      Math.max(firstWeek, Math.min(top, weeks ? weeks[0] : top) - 1),
      Math.min(endWeek, Math.max(bottom, weeks ? weeks[1] + 1 : bottom) + 1),
    ];
  }
  return scene;
}

function rowGeometry(scene: Scene, index: number, top: number, height: number, bandHeight: number, monthStart: boolean): SceneRow {
  const { rem } = scene.geo;
  const expanded = height >= scene.geo.expandAt;
  const band = expanded ? bandHeight : 0;
  const numberAlpha = textFade(height * 0.3, DAY_NUMBER_SIZE * rem);
  // The strips shrink with the fading numbers, so short rows keep their room for events.
  const header = monthStart ? numberAlpha * MONTH_HEADER * rem : 0;
  return {
    index,
    top,
    height,
    week: null,
    gapWeeks: 0,
    start: 0,
    expanded,
    timeTop: top + band,
    timeHeight: height - band,
    laneTop: top + header + PAD,
    laneHeight: MAX_LANE * rem,
    lanesShown: 0,
    numbersBottom: expanded ? top + band : top + height,
    numberAlpha,
    days: [],
  };
}

/** Fits a set of lanes into the row and returns how many lanes fit at all. */
function fitLanes(row: SceneRow, lanes: Lanes, rem: number): number {
  const available = row.numbersBottom - row.numberAlpha * DAY_NUMBERS * rem - row.laneTop - PAD;
  row.laneHeight = clamp(available / Math.max(1, lanes.count), MIN_LANE, MAX_LANE * rem);
  const capacity = Math.max(0, Math.floor(available / row.laneHeight + 1e-6));
  row.lanesShown = lanes.count > capacity ? Math.max(0, capacity - 1) : lanes.count;
  return capacity;
}

function colX(geo: Geometry, col: number) {
  return geo.colsX + col * geo.colWidth;
}

function barBox(geo: Geometry, row: SceneRow, area: Area, event: CalendarEvent, bar: { col0: number; col1: number; lane: number; isStart: boolean; isEnd: boolean }): EventBox {
  const x = colX(geo, bar.col0) + (bar.isStart ? PAD : 0);
  return {
    event,
    x,
    y: row.laneTop + bar.lane * row.laneHeight,
    w: colX(geo, bar.col1 + 1) - (bar.isEnd ? PAD : 0) - x,
    h: row.laneHeight - 1,
    area,
    isStart: bar.isStart,
    isEnd: bar.isEnd,
    label: bar.isStart,
  };
}

function addEvents(model: CalendarModel, scene: Scene, row: SceneRow) {
  const { geo } = scene;
  const week = row.week as number;
  const layout = model.layout(week);
  const lanes = row.expanded ? layout.band : layout.stack;
  const area: Area = row.expanded ? "band" : "stack";
  const capacity = fitLanes(row, lanes, geo.rem);
  const hidden = [0, 0, 0, 0, 0, 0, 0];

  for (const bar of lanes.bars) scene.visible.add(bar.event.id);
  for (const bar of lanes.bars) {
    if (bar.lane < row.lanesShown) scene.boxes.push(barBox(geo, row, area, bar.event, bar));
    else for (let col = bar.col0; col <= bar.col1; col++) hidden[col]++;
  }
  if (capacity > 0) {
    hidden.forEach((count, col) => {
      if (!count) return;
      scene.more.push({
        x: colX(geo, col) + PAD,
        y: row.laneTop + row.lanesShown * row.laneHeight,
        w: geo.colWidth - 2 * PAD,
        h: row.laneHeight - 1,
        count,
        week,
      });
    });
  }

  if (!row.expanded) return;
  const inner = geo.colWidth - 3 * PAD;
  for (const piece of layout.pieces) {
    scene.visible.add(piece.event.id);
    const width = inner / piece.columns;
    const y = row.timeTop + (piece.start / 1440) * row.timeHeight;
    scene.boxes.push({
      event: piece.event,
      x: colX(geo, piece.col) + PAD + piece.column * width,
      y,
      w: width - 1,
      h: Math.max(3, ((piece.end - piece.start) / 1440) * row.timeHeight - 1),
      area: "time",
      isStart: piece.isStart,
      isEnd: piece.isEnd,
      label: piece.isStart,
    });
  }
}

/** Boxes for an event that isn't part of the data yet, drawn over everything else. */
function addPreview(model: CalendarModel, scene: Scene, event: CalendarEvent, laneOf: string | null) {
  const { geo } = scene;
  const first = dayOf(event.start);
  const last = lastDayOf(event);
  for (const row of scene.rows) {
    if (row.week === null || row.start > last || row.start + 6 < first) continue;
    const layout = layoutWeek([event], row.start);
    if (row.expanded && !isBanded(event)) {
      for (const piece of layout.pieces) {
        scene.preview.push({
          event,
          x: colX(geo, piece.col) + PAD,
          y: row.timeTop + (piece.start / 1440) * row.timeHeight,
          w: geo.colWidth - 3 * PAD,
          h: Math.max(3, ((piece.end - piece.start) / 1440) * row.timeHeight - 1),
          area: "time",
          isStart: piece.isStart,
          isEnd: piece.isEnd,
          label: piece.isStart,
        });
      }
      continue;
    }
    const bar = (row.expanded ? layout.band : layout.stack).bars[0];
    if (!bar) continue;
    const existing = model.layout(row.week);
    const original = laneOf
      ? (row.expanded ? existing.band : existing.stack).bars.find((b) => b.event.id === laneOf)
      : undefined;
    const lane = original && original.lane < row.lanesShown ? original.lane : 0;
    scene.preview.push(barBox(geo, row, row.expanded ? "band" : "stack", event, { ...bar, lane }));
  }
}

/** Calendar position of content unit `unit` at content x `cx` (relative to the first column). */
export function locateUnit(model: CalendarModel, geo: Geometry, unit: number, cx: number): Location | null {
  const rows = model.rows;
  const i = Math.floor(unit);
  if (i < rows.first || i >= rows.end) return null;
  const row = rows.row(i);
  if (row.kind !== "week") return null;
  const fraction = unit - i;
  const col = clamp(Math.floor(cx / geo.colWidth), 0, 6);
  const day = weekStart(row.week, model.firstDay) + col;
  if (!model.inRange(day)) return null;
  const expanded = rows.rowHeight >= geo.expandAt;
  const band = model.bandHeight(row.week) / rows.rowHeight;
  const area: Area = !expanded ? "stack" : fraction < band ? "band" : "time";
  return {
    week: row.week,
    col,
    day,
    area,
    minutes: area === "time" ? clamp(((fraction - band) / (1 - band)) * 1440, 0, 1440) : 0,
  };
}

/** Calendar position under a screen point; points outside the body are clamped into it. */
export function locate(model: CalendarModel, geo: Geometry, x: number, y: number): Location | null {
  const unit = model.rows.pxToUnit(geo.scrollTop + clamp(y, 0, geo.height - 1));
  return locateUnit(model, geo, unit, x - geo.colsX);
}

const inside = (r: { x: number; y: number; w: number; h: number }, x: number, y: number) =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export function hitTest(model: CalendarModel, scene: Scene, x: number, y: number, events: boolean): Hit {
  const { geo } = scene;
  if (x >= geo.width - geo.strip) return { kind: "strip" };
  if (x < geo.gutter) return { kind: "gutter" };
  if (events) {
    const more = scene.more.find((m) => inside(m, x, y));
    if (more) return { kind: "more", more };
    for (let i = scene.boxes.length - 1; i >= 0; i--) {
      const box = scene.boxes[i] as EventBox;
      if (box.event.id === model.hiddenId || !inside(box, x, y)) continue;
      return { kind: "event", box, edge: model.canEdit(box.event) ? edgeAt(box, x, y) : null };
    }
  }
  return { kind: "empty", loc: locate(model, geo, x, y) };
}

function edgeAt(box: EventBox, x: number, y: number): "start" | "end" | null {
  const vertical = box.area === "time";
  const size = vertical ? box.h : box.w;
  const offset = vertical ? y - box.y : x - box.x;
  const tolerance = Math.min(EDGE, size / 4);
  if (box.isStart && offset < tolerance) return "start";
  if (box.isEnd && size - offset < tolerance) return "end";
  return null;
}

/** Where the detail panel should attach: the event's box, or its row when it's off screen. */
export function anchorOf(model: CalendarModel, scene: Scene, event: CalendarEvent) {
  const box =
    scene.boxes.find((b) => b.event.id === event.id && b.label) ?? scene.boxes.find((b) => b.event.id === event.id);
  if (box) return box;
  const { geo } = scene;
  const day = dayOf(event.start);
  const week = weekOf(day, model.firstDay);
  const y = model.rows.unitToPx(model.rows.unitOfWeek(week)) - geo.scrollTop;
  return { x: colX(geo, day - weekStart(week, model.firstDay)), y, w: geo.colWidth, h: 20 };
}

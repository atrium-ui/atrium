import { Formats, regionFirstDay } from "./format.ts";
import { isCalendarData, toICS } from "./ics.ts";
import { isBanded, layoutWeek, type WeekLayout } from "./layout.ts";
import type { PanelData } from "./panel.ts";
import { filterRows, type Row, Rows } from "./rows.ts";
import { defaultStrings, type Strings } from "./strings.ts";
import {
  clamp,
  dateOf,
  dayOf,
  isoDate,
  lastDayOf,
  minutesOf,
  minutesOn,
  parseIsoDate,
  weekOf,
  weekStart,
} from "./time.ts";
import type {
  CalendarEvent,
  CalendarEventMap,
  CalendarInfo,
  EventChanges,
  Participant,
  ResponseStatus,
} from "./types.ts";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 8;
export const TODAY_ZOOM = 1.5;
export const DEFAULT_ZOOM = 5;
export const BAND_RATIO = 0.15;
export const SNAP_MINUTES = 15;
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const FILTER_CONTEXT = 2;
const GAP_HEIGHT = 24;
const HISTORY_LIMIT = 50;
const SETTLE_MS = 600;
const ANIMATION_MS = 500;
const LAYOUT_CACHE_LIMIT = 4000;
/** Events per day that count as fully busy. */
const BUSY_COUNT = 6;

export type Emit = <K extends keyof CalendarEventMap>(type: K, detail: CalendarEventMap[K]) => void;
export type BusynessMode = "count" | "density";
export type ZoomLevel = "week" | "month" | "quarter" | "year";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What an interaction wants drawn: a new, moved, duplicated or resized event. */
export interface Preview {
  event: CalendarEvent;
  style: "create" | "ghost" | "copy" | "live";
  label: string | null;
  /** Keep the lanes of this existing event in the all-day band and chip stack. */
  laneOf: string | null;
}

export interface SummaryState {
  id: string;
  status: "streaming" | "done" | "error";
  text: string;
}

export interface StripMark {
  unit: number;
  span: number;
  col: number;
  color: string;
}

interface ViewEntry {
  week: number;
  zoom: number;
}

interface SavedState {
  date: string;
  offset: number;
  zoom: number;
}

interface Derived {
  byWeek: Map<number, CalendarEvent[]>;
  busy: Map<number, { count: number; minutes: number }>;
  shown: CalendarEvent[];
  weeks: [number, number] | null;
  rows: Row[] | null;
  layouts: Map<number, WeekLayout>;
  marks: StripMark[] | null;
}

const EMPTY: CalendarEvent[] = [];

const sameEmail = (a: string | undefined, b: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

/**
 * Everything the calendar knows and decides, without any DOM. The element renders it and feeds
 * it user input; the host receives the user's intentions through `emit`.
 */
export class CalendarModel {
  events: CalendarEvent[] = [];
  byId = new Map<string, CalendarEvent>();
  calendars = new Map<string, CalendarInfo>();
  hidden = new Set<string>();
  locked = new Set<string>();
  activeCalendar = "";
  userEmail = "";
  locale: string;
  formats: Formats;
  explicitFirstDay: number | null = null;
  firstDay: number;
  strings: Strings = defaultStrings;
  workHours: [number, number] = [8, 18];
  busynessMode: BusynessMode = "count";
  expandAt = 300;
  filter = "";
  /** First and last day that can be shown, `null` is unbounded. */
  minDay: number | null = null;
  maxDay: number | null = null;
  disabledLayers = new Set<string>();
  storageKey: string | null = null;

  width = 0;
  height = 0;
  zoom = DEFAULT_ZOOM;
  center = 0;
  scrollX = 0;
  animation: { t0: number; from: ViewEntry; to: ViewEntry } | null = null;
  velocity = 0;
  lastTick = 0;
  history: ViewEntry[] = [];
  historyIndex = -1;
  beforeFilter: ViewEntry | null = null;

  selection = new Set<string>();
  openId: string | null = null;
  hoverId: string | null = null;
  hiddenId: string | null = null;
  preview: Preview | null = null;
  selectionRect: Rect | null = null;
  summary: SummaryState | null = null;
  settleTimer: ReturnType<typeof setTimeout> | undefined;
  /** Bumped whenever data shown in the detail panel may have changed. */
  version = 0;
  derivedCache: Derived | null = null;
  rowsCache: Rows | null = null;

  constructor(
    readonly emit: Emit,
    readonly onChange: () => void,
    locale: string,
  ) {
    this.locale = locale;
    this.formats = new Formats(locale);
    this.firstDay = regionFirstDay(locale);
    this.center = weekOf(dayOf(new Date()), this.firstDay) + 0.5;
  }

  changed() {
    this.onChange();
  }

  /** Recomputes derived data and keeps the view on the same week. */
  rebuild() {
    const week = this.centerWeek;
    this.derivedCache = null;
    this.rowsCache = null;
    this.version++;
    this.zoom = this.clampZoom(this.zoom);
    this.center = this.clampCenter(this.rows.unitOfWeek(week));
    this.changed();
  }

  // Configuration

  setEvents(events: CalendarEvent[]) {
    this.events = events;
    this.byId = new Map(events.map((event) => [event.id, event]));
    const kept = [...this.selection].filter((id) => this.byId.has(id));
    if (kept.length !== this.selection.size) this.setSelection(kept);
    if (this.openId && !this.byId.has(this.openId)) this.close();
    this.rebuild();
  }

  setCalendars(calendars: CalendarInfo[]) {
    this.calendars = new Map(calendars.map((calendar) => [calendar.id, calendar]));
    this.rebuild();
  }

  setHidden(ids: Iterable<string>) {
    this.hidden = new Set(ids);
    this.rebuild();
  }

  setLocked(ids: Iterable<string>) {
    this.locked = new Set(ids);
    this.version++;
    this.changed();
  }

  setActiveCalendar(id: string) {
    this.activeCalendar = id;
    this.changed();
  }

  setUserEmail(email: string) {
    this.userEmail = email;
    this.version++;
    this.changed();
  }

  setLocale(locale: string) {
    this.locale = locale;
    this.formats = new Formats(locale);
    this.setFirstDay(this.explicitFirstDay);
  }

  setFirstDay(day: number | null) {
    this.explicitFirstDay = day;
    this.firstDay = day ?? regionFirstDay(this.locale);
    this.rebuild();
  }

  setStrings(strings: Strings) {
    this.strings = strings;
    this.version++;
    this.changed();
  }

  setWorkHours(hours: [number, number]) {
    if (!(hours[0] >= 0 && hours[0] < hours[1] && hours[1] <= 24)) throw new RangeError(`Invalid work hours ${hours}`);
    this.workHours = hours;
    this.changed();
  }

  setBusynessMode(mode: BusynessMode) {
    this.busynessMode = mode;
    this.changed();
  }

  setExpandAt(px: number) {
    this.expandAt = px;
    this.changed();
  }

  setRange(min: Date | null, max: Date | null) {
    const minDay = min && dayOf(min);
    const maxDay = max && dayOf(max);
    if (minDay !== null && maxDay !== null && minDay > maxDay) throw new RangeError(`minDate ${min} is after maxDate ${max}`);
    this.minDay = minDay;
    this.maxDay = maxDay;
    this.rebuild();
  }

  inRange(day: number): boolean {
    return (this.minDay === null || day >= this.minDay) && (this.maxDay === null || day <= this.maxDay);
  }

  /** First week and the week after the last one that can be shown. */
  get weekBounds(): [number, number] {
    return [
      this.minDay === null ? Number.NEGATIVE_INFINITY : weekOf(this.minDay, this.firstDay),
      this.maxDay === null ? Number.POSITIVE_INFINITY : weekOf(this.maxDay, this.firstDay) + 1,
    ];
  }

  setLayer(id: string, on: boolean) {
    if (on) this.disabledLayers.delete(id);
    else this.disabledLayers.add(id);
    this.changed();
  }

  setFilter(text: string) {
    const was = this.filter.trim() !== "";
    const is = text.trim() !== "";
    if (!was && is) this.beforeFilter = { week: this.centerWeek, zoom: this.zoom };
    this.filter = text;
    if (was && !is) {
      const back = this.beforeFilter as ViewEntry;
      this.beforeFilter = null;
      this.derivedCache = null;
      this.rowsCache = null;
      this.version++;
      this.zoom = back.zoom;
      this.center = back.week;
      this.moved();
      return;
    }
    this.rebuild();
  }

  // Derived data

  get derived(): Derived {
    if (this.derivedCache) return this.derivedCache;
    const query = this.filter.trim().toLowerCase();
    const byWeek = new Map<number, CalendarEvent[]>();
    const busy = new Map<number, { count: number; minutes: number }>();
    const shown: CalendarEvent[] = [];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const event of this.events) {
      if (this.hidden.has(event.calendarId)) continue;
      if (query && !event.title.toLowerCase().includes(query)) continue;
      const first = dayOf(event.start);
      const last = lastDayOf(event);
      for (let day = first; day <= last; day++) {
        const stats = busy.get(day) ?? { count: 0, minutes: 0 };
        const [start, end] = minutesOn(event, day, first, last);
        stats.count++;
        stats.minutes += event.allDay ? 0 : end - start;
        busy.set(day, stats);
      }
      if (event.busyOnly) continue;
      shown.push(event);
      const w0 = weekOf(first, this.firstDay);
      const w1 = weekOf(last, this.firstDay);
      for (let week = w0; week <= w1; week++) {
        const list = byWeek.get(week);
        if (list) list.push(event);
        else byWeek.set(week, [event]);
      }
      min = Math.min(min, w0);
      max = Math.max(max, w1);
    }
    this.derivedCache = {
      byWeek,
      busy,
      shown,
      weeks: shown.length ? [min, max] : null,
      rows: query ? filterRows(byWeek.keys(), FILTER_CONTEXT, this.weekBounds) : null,
      layouts: new Map(),
      marks: null,
    };
    return this.derivedCache;
  }

  layout(week: number): WeekLayout {
    const { layouts, byWeek } = this.derived;
    let layout = layouts.get(week);
    if (!layout) {
      if (layouts.size > LAYOUT_CACHE_LIMIT) layouts.clear();
      layout = layoutWeek(byWeek.get(week) ?? EMPTY, weekStart(week, this.firstDay));
      layouts.set(week, layout);
    }
    return layout;
  }

  /** 0..1 */
  busyness(day: number): number {
    const stats = this.derived.busy.get(day);
    if (!stats) return 0;
    if (this.busynessMode === "count") return Math.min(1, stats.count / BUSY_COUNT);
    return Math.min(1, stats.minutes / ((this.workHours[1] - this.workHours[0]) * 60));
  }

  /** Overview strip marks, positioned in row units which don't depend on the zoom. */
  get stripMarks(): StripMark[] {
    const derived = this.derived;
    if (!derived.marks) {
      const rows = this.rows;
      derived.marks = derived.shown.map((event) => {
        const first = dayOf(event.start);
        const w0 = weekOf(first, this.firstDay);
        const w1 = weekOf(lastDayOf(event), this.firstDay);
        const unit = rows.unitOfWeek(w0);
        return {
          unit,
          span: rows.unitOfWeek(w1) - unit + 1,
          col: first - weekStart(w0, this.firstDay),
          color: this.colorOf(event),
        };
      });
    }
    return derived.marks;
  }

  // Event facts

  calendarOf(event: CalendarEvent): CalendarInfo {
    const calendar = this.calendars.get(event.calendarId);
    if (!calendar) throw new Error(`Unknown calendar "${event.calendarId}" for event "${event.id}"`);
    return calendar;
  }

  colorOf(event: CalendarEvent): string {
    return this.calendarOf(event).color;
  }

  canEdit(event: CalendarEvent): boolean {
    return !event.readOnly && !this.locked.has(event.calendarId);
  }

  canEditTitle(event: CalendarEvent): boolean {
    return this.canEdit(event) && (!event.organizer || sameEmail(event.organizer.email, this.userEmail));
  }

  myself(event: CalendarEvent): Participant | undefined {
    return event.participants?.find((participant) => sameEmail(participant.email, this.userEmail));
  }

  invited(event: CalendarEvent): boolean {
    return !!this.myself(event) && !sameEmail(event.organizer?.email, this.userEmail);
  }

  unconfirmed(event: CalendarEvent): boolean {
    if (event.tentative) return true;
    const status = this.invited(event) ? this.myself(event)?.status : undefined;
    return status === "needs-action" || status === "tentative";
  }

  get canCreate(): boolean {
    return this.calendars.has(this.activeCalendar) && !this.locked.has(this.activeCalendar);
  }

  get openEvent(): CalendarEvent | null {
    return this.openId ? (this.byId.get(this.openId) ?? null) : null;
  }

  panelData(event: CalendarEvent): PanelData {
    return {
      event,
      calendar: this.calendarOf(event),
      formats: this.formats,
      strings: this.strings,
      canEdit: this.canEdit(event),
      canEditTitle: this.canEditTitle(event),
      invited: this.invited(event),
      response: this.myself(event)?.status ?? null,
      userEmail: this.userEmail,
      summary: this.summary?.id === event.id ? this.summary : null,
    };
  }

  // View

  get rowHeight() {
    return Math.max(1, this.height / this.zoom);
  }

  get rows(): Rows {
    if (!this.rowsCache) {
      this.rowsCache = new Rows(this.rowHeight, GAP_HEIGHT, this.derived.rows, this.beforeFilter?.week ?? 0, this.weekBounds);
    }
    return this.rowsCache;
  }

  get scrollTop() {
    return this.rows.unitToPx(this.center) - this.height / 2;
  }

  get centerWeek() {
    return this.rows.weekOfUnit(this.center);
  }

  get colWidth() {
    return this.width / 7;
  }

  get maxScrollX() {
    return Math.max(0, this.colWidth * 7 - this.width);
  }

  get zoomLevel(): ZoomLevel {
    if (this.zoom <= 2) return "week";
    if (this.zoom <= 6) return "month";
    if (this.zoom <= 16) return "quarter";
    return "year";
  }

  get moving() {
    return this.animation !== null || this.velocity !== 0;
  }

  /** Fraction of an expanded row at a time of day. */
  rowFraction(minutes: number) {
    return BAND_RATIO + ((1 - BAND_RATIO) * minutes) / 1440;
  }

  /** Keeps the view inside the rows; within a date range the viewport never shows weeks outside of it. */
  clampCenter(unit: number, zoom = this.zoom) {
    const items = this.rows.items;
    if (items) return clamp(unit, 0, items.length);
    const [first, end] = this.weekBounds;
    const lo = first + zoom / 2;
    const hi = end - zoom / 2;
    return lo > hi ? (first + end) / 2 : clamp(unit, lo, hi);
  }

  /** At most as many weeks as the date range has. */
  clampZoom(zoom: number) {
    const [first, end] = this.weekBounds;
    return clamp(zoom, MIN_ZOOM, Math.min(MAX_ZOOM, end - first));
  }

  setViewport(width: number, height: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.rowsCache = null;
    this.scrollX = clamp(this.scrollX, 0, this.maxScrollX);
    this.changed();
  }

  moved() {
    this.scheduleSettle();
    this.changed();
  }

  scrollBy(dx: number, dy: number) {
    const rows = this.rows;
    this.center = this.clampCenter(rows.pxToUnit(rows.unitToPx(this.center) + dy));
    this.scrollX = clamp(this.scrollX + dx, 0, this.maxScrollX);
    this.moved();
  }

  /** Zooms to `zoom` visible weeks, keeping the content at viewport height `y` in place. */
  zoomAt(zoom: number, y: number) {
    const next = this.clampZoom(zoom);
    if (next === this.zoom) return;
    const anchor = this.rows.pxToUnit(this.scrollTop + y);
    this.zoom = next;
    this.rowsCache = null;
    const rows = this.rows;
    this.center = this.clampCenter(rows.pxToUnit(rows.unitToPx(anchor) - y + this.height / 2));
    this.moved();
  }

  centerOn(unit: number) {
    this.stopMotion();
    this.center = this.clampCenter(unit);
    this.moved();
  }

  animateTo(week: number, zoom: number) {
    const next = this.clampZoom(zoom);
    this.velocity = 0;
    this.animation = {
      t0: performance.now(),
      from: { week: this.center, zoom: this.zoom },
      to: { week: this.clampCenter(this.rows.unitOfWeek(week), next), zoom: next },
    };
    this.changed();
  }

  stopMotion() {
    this.animation = null;
    this.velocity = 0;
  }

  /** Touch inertia, in px per ms. */
  fling(velocity: number) {
    this.velocity = velocity;
    this.lastTick = 0;
    this.changed();
  }

  /** Advances animations and inertia. Called once per frame. */
  tick(now: number) {
    const dt = this.lastTick ? Math.min(64, now - this.lastTick) : 16;
    this.lastTick = now;
    const animation = this.animation;
    if (animation) {
      const progress = clamp((now - animation.t0) / ANIMATION_MS, 0, 1);
      const eased = 1 - (1 - progress) ** 3;
      this.zoom = animation.from.zoom * (animation.to.zoom / animation.from.zoom) ** eased;
      this.rowsCache = null;
      this.center = this.clampCenter(animation.from.week + (animation.to.week - animation.from.week) * eased);
      if (progress === 1) this.animation = null;
      this.scheduleSettle();
    }
    if (this.velocity) {
      this.scrollBy(0, this.velocity * dt);
      this.velocity *= Math.exp(-dt / 325);
      if (Math.abs(this.velocity) < 0.01) this.velocity = 0;
    }
  }

  goToday() {
    const now = new Date();
    this.animateTo(weekOf(dayOf(now), this.firstDay) + this.rowFraction(minutesOf(now)), TODAY_ZOOM);
  }

  goMonth() {
    const now = new Date();
    const w0 = weekOf(dayOf(new Date(now.getFullYear(), now.getMonth(), 1)), this.firstDay);
    const w1 = weekOf(dayOf(new Date(now.getFullYear(), now.getMonth() + 1, 0)), this.firstDay);
    const weeks = w1 - w0 + 1;
    this.animateTo(w0 + weeks / 2, weeks);
  }

  goTo(date: Date) {
    this.animateTo(weekOf(dayOf(date), this.firstDay) + this.rowFraction(minutesOf(date)), this.zoom);
  }

  zoomToWeek(week: number) {
    this.animateTo(week + 0.5, TODAY_ZOOM);
  }

  // History and persistence

  get canBack() {
    return this.historyIndex > 0;
  }

  get canForward() {
    return this.historyIndex < this.history.length - 1;
  }

  back() {
    if (!this.filter) this.record();
    if (!this.canBack) return;
    this.historyIndex--;
    this.travel();
  }

  forward() {
    if (!this.canForward) return;
    this.historyIndex++;
    this.travel();
  }

  travel() {
    const entry = this.history[this.historyIndex] as ViewEntry;
    this.animateTo(entry.week, entry.zoom);
  }

  scheduleSettle() {
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.settle(), SETTLE_MS);
  }

  settle() {
    if (this.moving) return this.scheduleSettle();
    if (!this.filter) this.record();
    this.save();
  }

  /** Remembers the resting place; small adjustments update the current entry instead. */
  record() {
    const entry = { week: this.centerWeek, zoom: this.zoom };
    const current = this.history[this.historyIndex];
    if (current && !isFar(current, entry)) {
      this.history[this.historyIndex] = entry;
      return;
    }
    this.history = [...this.history.slice(0, this.historyIndex + 1), entry].slice(-HISTORY_LIMIT);
    this.historyIndex = this.history.length - 1;
    this.changed();
  }

  save() {
    if (!this.storageKey) return;
    const position = this.beforeFilter?.week ?? this.centerWeek;
    const week = Math.floor(position);
    const state: SavedState = {
      date: isoDate(dateOf(weekStart(week, this.firstDay))),
      offset: position - week,
      zoom: this.beforeFilter?.zoom ?? this.zoom,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  /** Restores the remembered view. Without one the calendar opens on today. */
  restore() {
    const raw = this.storageKey ? localStorage.getItem(this.storageKey) : null;
    if (!raw) return;
    const state = JSON.parse(raw) as SavedState;
    this.zoom = this.clampZoom(state.zoom);
    this.rowsCache = null;
    this.center = this.clampCenter(weekOf(dayOf(parseIsoDate(state.date)), this.firstDay) + state.offset);
    this.changed();
  }

  dispose() {
    clearTimeout(this.settleTimer);
    this.stopMotion();
  }

  // Selection and pointer state

  setSelection(ids: Iterable<string>) {
    const next = new Set(ids);
    if (next.size === this.selection.size && [...next].every((id) => this.selection.has(id))) return;
    this.selection = next;
    this.emit("selection-change", { ids: [...next] });
    this.changed();
  }

  toggleSelection(id: string) {
    const next = new Set(this.selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.setSelection(next);
  }

  open(id: string) {
    if (this.openId === id) return;
    this.cancelSummary();
    this.openId = id;
    this.version++;
    this.changed();
  }

  close() {
    if (!this.openId) return;
    this.cancelSummary();
    this.openId = null;
    this.version++;
    this.changed();
  }

  setHover(id: string | null) {
    if (this.hoverId === id) return;
    this.hoverId = id;
    this.changed();
  }

  setPreview(preview: Preview | null, hiddenId: string | null = null, selectionRect: Rect | null = null) {
    this.preview = preview;
    this.hiddenId = hiddenId;
    this.selectionRect = selectionRect;
    this.changed();
  }

  /** Selects events of the active calendar inside a block of days, optionally limited to a time of day. */
  boxSelect(weeks: [number, number], cols: [number, number], minutes: [number, number] | null, add: boolean) {
    const ids = new Set(add ? this.selection : []);
    for (let week = weeks[0]; week <= weeks[1]; week++) {
      for (const event of this.derived.byWeek.get(week) ?? EMPTY) {
        const first = dayOf(event.start);
        const last = lastDayOf(event);
        for (let col = cols[0]; col <= cols[1]; col++) {
          const day = weekStart(week, this.firstDay) + col;
          if (day < first || day > last) continue;
          if (minutes) {
            if (isBanded(event)) continue;
            const [start, end] = minutesOn(event, day, first, last);
            if (start >= minutes[1] || Math.max(end, start + 1) <= minutes[0]) continue;
          }
          ids.add(event.id);
          break;
        }
      }
    }
    this.setSelection(ids);
    this.emit("range-select", {
      from: dateOf(weekStart(weeks[0], this.firstDay) + cols[0]),
      to: dateOf(weekStart(weeks[1], this.firstDay) + cols[1] + 1),
      columns: cols,
      minutes,
    });
  }

  get selectedEvents(): CalendarEvent[] {
    return [...this.selection].flatMap((id) => this.byId.get(id) ?? []);
  }

  // Requests to the host

  create(start: Date, end: Date, allDay: boolean, duplicateOf?: string) {
    this.emit("event-create", { start, end, allDay, calendarId: this.activeCalendar, duplicateOf });
  }

  change(id: string, changes: EventChanges) {
    this.emit("event-change", { id, changes });
  }

  respond(id: string, response: ResponseStatus) {
    this.change(id, { response });
    this.close();
  }

  delete(ids: string[]) {
    this.emit("events-delete", { ids });
    if (this.openId && ids.includes(this.openId)) this.close();
    this.setSelection([...this.selection].filter((id) => !ids.includes(id)));
  }

  copy(): string | null {
    const events = this.selectedEvents;
    if (!events.length) return null;
    this.notify(this.strings.copied(events.length));
    return toICS(events);
  }

  importData(data: string, fileName: string | null) {
    const name = fileName ?? this.strings.clipboard;
    if (!isCalendarData(data)) return this.notify(this.strings.invalidFile(name));
    if (!this.canCreate) return this.notify(this.strings.noWritableCalendar);
    this.emit("calendar-import", { data, fileName, calendarId: this.activeCalendar });
    this.notify(this.strings.importing(name));
  }

  refresh() {
    this.emit("refresh-request", {});
  }

  // Summaries

  requestSummary() {
    const event = this.openEvent;
    if (!event) return;
    this.summary = { id: event.id, status: "streaming", text: "" };
    this.version++;
    this.emit("summary-request", { id: event.id, text: event.description ?? "" });
    this.changed();
  }

  cancelSummary() {
    if (this.summary?.status === "streaming") this.emit("summary-cancel", { id: this.summary.id });
    this.summary = null;
  }

  /** Chunks for a summary that was cancelled in the meantime are dropped. */
  updateSummary(id: string, update: (summary: SummaryState) => SummaryState) {
    if (this.summary?.id !== id || this.summary.status !== "streaming") return;
    this.summary = update(this.summary);
    this.version++;
    this.changed();
  }

  /** Feedback for the user, e.g. after copying or a failed import. Shown by the host. */
  notify(text: string) {
    this.emit("notify", { text });
  }
}

function isFar(a: ViewEntry, b: ViewEntry) {
  return (
    Math.abs(a.week - b.week) > Math.max(1, Math.min(a.zoom, b.zoom) / 2) ||
    Math.abs(Math.log(a.zoom / b.zoom)) > Math.log(1.5)
  );
}

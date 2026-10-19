import { dayOf, lastDayOf, minutesOn } from "./time.ts";
import type { CalendarEvent } from "./types.ts";

/** A horizontal piece of an event inside one week: a chip or an all-day bar. */
export interface Bar {
  event: CalendarEvent;
  col0: number;
  col1: number;
  lane: number;
  /** The event really starts / ends inside this week. */
  isStart: boolean;
  isEnd: boolean;
}

/** A vertical piece of a timed event inside one day of the time area. */
export interface Piece {
  event: CalendarEvent;
  col: number;
  /** Minutes after midnight. */
  start: number;
  end: number;
  column: number;
  columns: number;
  isStart: boolean;
  isEnd: boolean;
}

export interface Lanes {
  bars: Bar[];
  count: number;
}

export interface WeekLayout {
  /** All-day band of expanded rows. */
  band: Lanes;
  /** Chip stack of collapsed rows. */
  stack: Lanes;
  /** Time area of expanded rows. */
  pieces: Piece[];
}

interface Span {
  event: CalendarEvent;
  first: number;
  last: number;
  col0: number;
  col1: number;
  multi: boolean;
}

const DAY_MS = 86_400_000;

/** All-day events and events lasting a day or longer live in the all-day band. */
export function isBanded(event: CalendarEvent): boolean {
  return event.allDay || event.end.getTime() - event.start.getTime() >= DAY_MS;
}

export function layoutWeek(events: readonly CalendarEvent[], firstDay: number): WeekLayout {
  const spans: Span[] = events.map((event) => {
    const first = dayOf(event.start);
    const last = lastDayOf(event);
    return {
      event,
      first,
      last,
      col0: Math.max(first - firstDay, 0),
      col1: Math.min(last - firstDay, 6),
      multi: last > first,
    };
  });

  const pieces: Piece[] = [];
  for (const span of spans) {
    if (isBanded(span.event)) continue;
    for (let col = span.col0; col <= span.col1; col++) {
      const day = firstDay + col;
      const [start, end] = minutesOn(span.event, day, span.first, span.last);
      pieces.push({
        event: span.event,
        col,
        start,
        end,
        column: 0,
        columns: 1,
        isStart: day === span.first,
        isEnd: day === span.last,
      });
    }
  }
  for (let col = 0; col < 7; col++) assignColumns(pieces.filter((piece) => piece.col === col));

  return {
    band: assignLanes(
      spans.filter((span) => isBanded(span.event)),
      firstDay,
    ),
    stack: assignLanes(spans, firstDay),
    pieces,
  };
}

/** Multi-day events first so they keep one lane across the week, then single days by time. */
function compareSpans(a: Span, b: Span): number {
  if (a.multi !== b.multi) return a.multi ? -1 : 1;
  if (a.multi) {
    return a.first - b.first || b.last - b.first - (a.last - a.first) || compareEvents(a.event, b.event);
  }
  return Number(b.event.allDay) - Number(a.event.allDay) || compareEvents(a.event, b.event);
}

function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
  return (
    a.start.getTime() - b.start.getTime() ||
    b.end.getTime() - a.end.getTime() ||
    a.title.localeCompare(b.title) ||
    a.id.localeCompare(b.id)
  );
}

function assignLanes(spans: Span[], firstDay: number): Lanes {
  const taken: boolean[][] = Array.from({ length: 7 }, () => []);
  let count = 0;
  const bars = [...spans].sort(compareSpans).map((span): Bar => {
    let lane = 0;
    while (taken.slice(span.col0, span.col1 + 1).some((lanes) => lanes[lane])) lane++;
    for (let col = span.col0; col <= span.col1; col++) (taken[col] as boolean[])[lane] = true;
    count = Math.max(count, lane + 1);
    return {
      event: span.event,
      col0: span.col0,
      col1: span.col1,
      lane,
      isStart: span.first >= firstDay,
      isEnd: span.last <= firstDay + 6,
    };
  });
  return { bars, count };
}

/** Overlapping pieces share the width of their cluster, pieces without overlaps keep all of it. */
function assignColumns(pieces: Piece[]) {
  pieces.sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: Piece[] = [];
  let ends: number[] = [];
  let clusterEnd = Number.NEGATIVE_INFINITY;
  const flush = () => {
    for (const piece of cluster) piece.columns = ends.length;
    cluster = [];
    ends = [];
  };
  for (const piece of pieces) {
    const end = Math.max(piece.end, piece.start + 15);
    if (piece.start >= clusterEnd) flush();
    let column = ends.findIndex((columnEnd) => columnEnd <= piece.start);
    if (column < 0) column = ends.push(end) - 1;
    else ends[column] = end;
    piece.column = column;
    cluster.push(piece);
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
}
